import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const log = (message: string, data?: any) => {
  console.log(`[SEED] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const handleError = (error: any, entity: string) => {
  if (error.response && error.response.status === 400) {
    log(`${entity} ya existe, continuando...`);
  } else {
    console.error(`Error creando ${entity}:`, error.response?.data || error.message);
    throw error;
  }
};

async function main() {
  log('--- INICIANDO SCRIPT DE SEEDING ---');

  // 1. Crear usuarios
  log('Paso 1: Creando usuarios...');
  const users = {
    admin: { email: 'admin@test.com', password: 'admin123', role: 'ADMIN' },
    student: { email: 'student@test.com', password: 'student123', role: 'STUDENT' },
    professor: { email: 'professor@test.com', password: 'prof123', role: 'ADMIN' },
  };

  try {
    await axios.post(`${BASE_URL}/auth/register`, users.admin);
    log('Usuario admin creado.');
  } catch (error) {
    handleError(error, 'Admin');
  }

  try {
    await axios.post(`${BASE_URL}/auth/register`, users.student);
    log('Usuario student creado.');
  } catch (error) {
    handleError(error, 'Student');
  }

  try {
    await axios.post(`${BASE_URL}/auth/register`, users.professor);
    log('Usuario professor creado.');
  } catch (error) {
    handleError(error, 'Professor');
  }

  // 2. Autenticar usuarios
  log('\nPaso 2: Autenticando usuarios...');
  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, { email: users.admin.email, password: users.admin.password });
  const studentLogin = await axios.post(`${BASE_URL}/auth/login`, { email: users.student.email, password: users.student.password });
  const professorLogin = await axios.post(`${BASE_URL}/auth/login`, { email: users.professor.email, password: users.professor.password });

  const adminToken = adminLogin.data.access_token;
  const studentId = studentLogin.data.user.id;
  const professorId = professorLogin.data.user.id;

  log('Tokens obtenidos.');

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 3. Crear curso
  log('\nPaso 3: Creando curso...');
  const coursePayload = {
    name: 'Estructuras de Datos',
    nrc: `TEST${Math.floor(1000 + Math.random() * 9000)}`,
    period: '2025-1',
    group: 1,
  };
  let courseId: string;
  try {
    const courseResponse = await axios.post(`${BASE_URL}/courses`, coursePayload, { headers: adminHeaders });
    courseId = courseResponse.data.id;
    log(`Curso creado: ${courseResponse.data.name} (ID: ${courseId})`);
  } catch (error) {
    handleError(error, 'Curso');
    const coursesResponse = await axios.get(`${BASE_URL}/courses`, { headers: adminHeaders });
    courseId = coursesResponse.data[0].id;
    log(`Usando curso existente (ID: ${courseId})`);
  }

  // 4. Inscribir estudiante
  log('\nPaso 4: Inscribiendo estudiante...');
  try {
    await axios.post(`${BASE_URL}/courses/${courseId}/enroll`, { studentId }, { headers: adminHeaders });
    log('Estudiante inscrito.');
  } catch (error) {
    handleError(error, 'Inscripción de estudiante');
  }

  // 5. Asignar profesor
  log('\nPaso 5: Asignando profesor...');
  try {
    await axios.post(`${BASE_URL}/courses/${courseId}/professors`, { professorId }, { headers: adminHeaders });
    log('Profesor asignado.');
  } catch (error) {
    handleError(error, 'Asignación de profesor');
  }

  // 6. Crear challenge
  log('\nPaso 6: Creando challenge...');
  const challengePayload = {
    title: 'Suma de N números',
    description: 'Dado un número N, calcular la suma de 1 hasta N.',
    difficulty: 'EASY',
    tags: 'matematicas,basico',
    timeLimit: 1000,
    memoryLimit: 128,
    status: 'PUBLISHED',
    testCases: [
      { input: '5', expectedOutput: '15', isHidden: false },
      { input: '10', expectedOutput: '55', isHidden: true },
    ],
  };
  let challengeId: string;
  try {
    const challengeResponse = await axios.post(`${BASE_URL}/challenges`, challengePayload, { headers: adminHeaders });
    challengeId = challengeResponse.data.id;
    log(`Challenge creado: ${challengeResponse.data.title} (ID: ${challengeId})`);
  } catch (error) {
    handleError(error, 'Challenge');
    const challengesResponse = await axios.get(`${BASE_URL}/challenges`, { headers: adminHeaders });
    challengeId = challengesResponse.data.find(c => c.title === challengePayload.title)?.id;
    if (!challengeId) throw new Error('No se pudo encontrar el challenge existente.');
    log(`Usando challenge existente (ID: ${challengeId})`);
  }

  // 7. Asignar challenge a curso
  log('\nPaso 7: Asignando challenge al curso...');
  try {
    await axios.post(`${BASE_URL}/courses/${courseId}/challenges`, { challengeId }, { headers: adminHeaders });
    log('Challenge asignado al curso.');
  } catch (error) {
    handleError(error, 'Asignación de challenge');
  }

  // 8. Crear evaluación
  log('\nPaso 8: Creando evaluación...');
  const evaluationPayload = {
    name: 'Parcial 1 - Estructuras de Datos',
    startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration: 90,
    maxAttempts: 3,
    challengeIds: [challengeId],
    courseIds: [courseId],
  };
  try {
    const evaluationResponse = await axios.post(`${BASE_URL}/evaluations`, evaluationPayload, { headers: adminHeaders });
    log(`Evaluación creada: ${evaluationResponse.data.name} (ID: ${evaluationResponse.data.id})`);
  } catch (error) {
    handleError(error, 'Evaluación');
  }

  log('\n--- SCRIPT DE SEEDING FINALIZADO ---');
}

main().catch((error) => {
  console.error('\n[SEED] Ha ocurrido un error fatal:');
  console.error(error.response?.data || error.message);
  process.exit(1);
});
