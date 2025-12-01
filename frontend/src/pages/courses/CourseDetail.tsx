import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesApi } from '../../api/courses.api';
import { challengesApi } from '../../api/challenges.api';
import { authApi, UserListItem } from '../../api/auth.api';
import { CourseWithDetails } from '../../types/course.types';
import { Challenge } from '../../types/challenge.types';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Plus, 
  Trash2, 
  Settings, 
  GraduationCap,
  ArrowLeft,
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [allStudents, setAllStudents] = useState<UserListItem[]>([]);
  const [allAdmins, setAllAdmins] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState('');

  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCourseData(),
        loadAvailableChallenges(),
        loadUsers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async () => {
    try {
      const courseData = await coursesApi.getCourseById(id!);
      setCourse(courseData);
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      navigate('/courses');
    }
  };

  const loadAvailableChallenges = async () => {
    try {
      const challenges = await challengesApi.getChallenges();
      setAvailableChallenges(challenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const [students, admins] = await Promise.all([
        authApi.getUsers('STUDENT'),
        authApi.getUsers('ADMIN'),
      ]);
      setAllStudents(students);
      setAllAdmins(admins);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentId || !id) return;

    try {
      await coursesApi.enrollStudent(id, { studentId: selectedStudentId });
      toast.success('Estudiante inscrito exitosamente!');
      setSelectedStudentId('');
      loadCourseData();
    } catch (error: any) {
      console.error('Error enrolling student:', error);
      toast.error(error.response?.data?.message || 'Error al inscribir estudiante');
    }
  };

  const handleAssignProfessor = async () => {
    if (!selectedProfessorId || !id) return;

    try {
      await coursesApi.assignProfessor(id, { professorId: selectedProfessorId });
      toast.success('Profesor asignado exitosamente!');
      setSelectedProfessorId('');
      loadCourseData();
    } catch (error: any) {
      console.error('Error assigning professor:', error);
      toast.error(error.response?.data?.message || 'Error al asignar profesor');
    }
  };

  const handleAssignChallenge = async () => {
    if (!selectedChallengeId || !id) return;

    try {
      await coursesApi.assignChallenge(id, { challengeId: selectedChallengeId });
      toast.success('Reto asignado exitosamente!');
      setSelectedChallengeId('');
      loadCourseData();
    } catch (error: any) {
      console.error('Error assigning challenge:', error);
      toast.error(error.response?.data?.message || 'Error al asignar reto');
    }
  };

  // Filter out already enrolled students
  const availableStudents = allStudents.filter(
    student => !course?.enrollments?.some(e => e.user.id === student.id)
  );

  // Filter out already assigned professors
  const availableProfessors = allAdmins.filter(
    admin => !course?.professors?.some(p => p.user.id === admin.id)
  );

  // Filter out already assigned challenges
  const availableChallengesFiltered = availableChallenges.filter(
    challenge => !course?.courseChallenges?.some(cc => cc.challenge.id === challenge.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-white mb-4">Curso no encontrado</h3>
          <Button onClick={() => navigate('/courses')}>
            Volver a Cursos
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Cursos
          </button>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.name}</h1>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                    NRC: {course.nrc}
                  </span>
                  <span>{course.period}</span>
                  <span>Grupo {course.group}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-cyan-400">{course.enrollments?.length || 0}</p>
                  <p className="text-sm text-slate-400">Estudiantes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-400">{course.professors?.length || 0}</p>
                  <p className="text-sm text-slate-400">Profesores</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-400">{course.courseChallenges?.length || 0}</p>
                  <p className="text-sm text-slate-400">Retos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Challenges */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Code className="w-6 h-6 mr-2 text-amber-400" />
                  Retos del Curso
                </h2>
                {isAdmin && availableChallengesFiltered.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar reto...</option>
                      {availableChallengesFiltered.map((challenge) => (
                        <option key={challenge.id} value={challenge.id}>
                          {challenge.title} ({challenge.difficulty})
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={handleAssignChallenge}
                      disabled={!selectedChallengeId}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {course.courseChallenges && course.courseChallenges.length > 0 ? (
                <div className="space-y-3">
                  {course.courseChallenges.map((courseChallenge) => (
                    <div 
                      key={courseChallenge.id} 
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-cyan-500/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-white">{courseChallenge.challenge.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            courseChallenge.challenge.difficulty === 'EASY' 
                              ? 'bg-green-500/20 text-green-400'
                              : courseChallenge.challenge.difficulty === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {courseChallenge.challenge.difficulty}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            courseChallenge.challenge.status === 'PUBLISHED'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {courseChallenge.challenge.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => navigate(`/challenges/${courseChallenge.challenge.id}`)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No hay retos asignados a este curso.</p>
                  {isAdmin && (
                    <p className="text-slate-500 text-sm mt-2">
                      Usa el selector de arriba para asignar retos.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrolled Students */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white flex items-center mb-4">
                <GraduationCap className="w-6 h-6 mr-2 text-cyan-400" />
                Estudiantes ({course.enrollments?.length || 0})
              </h2>

              {isAdmin && availableStudents.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar estudiante...</option>
                      {availableStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.email}
                        </option>
                      ))}
                    </select>
                    <Button 
                      size="sm" 
                      onClick={handleEnrollStudent}
                      disabled={!selectedStudentId}
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {course.enrollments && course.enrollments.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {course.enrollments.map((enrollment) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                          <span className="text-cyan-400 text-sm font-medium">
                            {enrollment.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-slate-300">{enrollment.user.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  No hay estudiantes inscritos.
                </p>
              )}
            </div>

            {/* Course Professors */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white flex items-center mb-4">
                <Users className="w-6 h-6 mr-2 text-purple-400" />
                Profesores ({course.professors?.length || 0})
              </h2>

              {isAdmin && availableProfessors.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <select
                      value={selectedProfessorId}
                      onChange={(e) => setSelectedProfessorId(e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar profesor...</option>
                      {availableProfessors.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.email}
                        </option>
                      ))}
                    </select>
                    <Button 
                      size="sm" 
                      onClick={handleAssignProfessor}
                      disabled={!selectedProfessorId}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {course.professors && course.professors.length > 0 ? (
                <div className="space-y-2">
                  {course.professors.map((professor) => (
                    <div 
                      key={professor.id} 
                      className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                          <span className="text-purple-400 text-sm font-medium">
                            {professor.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-slate-300">{professor.user.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  No hay profesores asignados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
