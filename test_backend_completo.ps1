# Script de prueba completa del backend
# Flujo completo del sistema

$baseUrl = "http://localhost:3000"
$adminToken = ""
$studentToken = ""
$professorToken = ""

Write-Host "=== PRUEBA COMPLETA DEL BACKEND ===" -ForegroundColor Green
Write-Host ""

# Paso 1: Crear usuarios
Write-Host "1. Creando usuarios..." -ForegroundColor Yellow

# Crear admin
$adminBody = @{
    email = "admin@test.com"
    password = "admin123"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $adminBody -ContentType "application/json"
    Write-Host "   Admin creado: $($adminResponse.email)" -ForegroundColor Green
} catch {
    Write-Host "   Admin ya existe o error: $_" -ForegroundColor Yellow
}

# Crear estudiante
$studentBody = @{
    email = "student@test.com"
    password = "student123"
    role = "STUDENT"
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $studentBody -ContentType "application/json"
    Write-Host "   Estudiante creado: $($studentResponse.email)" -ForegroundColor Green
} catch {
    Write-Host "   Estudiante ya existe o error: $_" -ForegroundColor Yellow
}

# Crear profesor
$professorBody = @{
    email = "professor@test.com"
    password = "prof123"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $professorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $professorBody -ContentType "application/json"
    Write-Host "   Profesor creado: $($professorResponse.email)" -ForegroundColor Green
} catch {
    Write-Host "   Profesor ya existe o error: $_" -ForegroundColor Yellow
}

Write-Host ""

# Paso 2: Login
Write-Host "2. Autenticando usuarios..." -ForegroundColor Yellow

# Login admin
$adminLogin = @{
    email = "admin@test.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    $adminToken = $adminLoginResponse.access_token
    Write-Host "   Admin autenticado" -ForegroundColor Green
} catch {
    Write-Host "   Error en login admin: $_" -ForegroundColor Red
    exit 1
}

# Login estudiante
$studentLogin = @{
    email = "student@test.com"
    password = "student123"
} | ConvertTo-Json

try {
    $studentLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $studentLogin -ContentType "application/json"
    $studentToken = $studentLoginResponse.access_token
    Write-Host "   Estudiante autenticado" -ForegroundColor Green
} catch {
    Write-Host "   Error en login estudiante: $_" -ForegroundColor Red
    exit 1
}

# Login profesor
$professorLogin = @{
    email = "professor@test.com"
    password = "prof123"
} | ConvertTo-Json

try {
    $professorLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $professorLogin -ContentType "application/json"
    $professorToken = $professorLoginResponse.access_token
    Write-Host "   Profesor autenticado" -ForegroundColor Green
} catch {
    Write-Host "   Error en login profesor: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 3: Crear curso
Write-Host "3. Creando curso..." -ForegroundColor Yellow

$randomNrc = "TEST" + (Get-Random -Minimum 1000 -Maximum 9999)
$courseBody = @{
    name = "Estructuras de Datos"
    nrc = $randomNrc
    period = "2025-1"
    group = 1
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

try {
    $courseResponse = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Body $courseBody -Headers $headers
    $courseId = $courseResponse.id
    Write-Host "   Curso creado: $($courseResponse.name) (ID: $courseId)" -ForegroundColor Green
} catch {
    Write-Host "   Curso ya existe, obteniendo..." -ForegroundColor Yellow
    try {
        $courses = Invoke-RestMethod -Uri "$baseUrl/courses" -Method GET -Headers $headers
        if ($courses.Count -gt 0) {
            $courseId = $courses[0].id
            Write-Host "   Usando curso existente: $courseId" -ForegroundColor Green
        } else {
            Write-Host "   No hay cursos disponibles" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "   Error obteniendo cursos: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Paso 4: Inscribir estudiante
Write-Host "4. Inscribiendo estudiante al curso..." -ForegroundColor Yellow

$enrollBody = @{
    studentId = $studentLoginResponse.user.id
} | ConvertTo-Json

try {
    $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" -Method POST -Body $enrollBody -Headers $headers
    Write-Host "   Estudiante inscrito en curso" -ForegroundColor Green
} catch {
    Write-Host "   Estudiante ya inscrito o error: $_" -ForegroundColor Yellow
}

Write-Host ""

# Paso 5: Asignar profesor
Write-Host "5. Asignando profesor al curso..." -ForegroundColor Yellow

$professorAssignBody = @{
    professorId = $professorLoginResponse.user.id
} | ConvertTo-Json

try {
    $professorAssignResponse = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/professors" -Method POST -Body $professorAssignBody -Headers $headers
    Write-Host "   Profesor asignado al curso" -ForegroundColor Green
} catch {
    Write-Host "   Profesor ya asignado o error: $_" -ForegroundColor Yellow
}

Write-Host ""

# Paso 6: Crear challenge
Write-Host "6. Creando challenge..." -ForegroundColor Yellow

$challengeBody = @{
    title = "Suma de N numeros"
    description = "Dado un numero N, calcular la suma de 1 hasta N"
    difficulty = "EASY"
    tags = @("matematicas", "basico")
    timeLimit = 1000
    memoryLimit = 128
    testCases = @(
        @{
            input = "5"
            expectedOutput = "15"
            isHidden = $false
        },
        @{
            input = "10"
            expectedOutput = "55"
            isHidden = $true
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $challengeResponse = Invoke-RestMethod -Uri "$baseUrl/challenges" -Method POST -Body $challengeBody -Headers $headers
    $challengeId = $challengeResponse.id
    Write-Host "   Challenge creado: $($challengeResponse.title) (ID: $challengeId)" -ForegroundColor Green
} catch {
    Write-Host "   Challenge ya existe, obteniendo..." -ForegroundColor Yellow
    try {
        $challenges = Invoke-RestMethod -Uri "$baseUrl/challenges" -Method GET -Headers $headers
        if ($challenges.Count -gt 0) {
            $challengeId = $challenges[0].id
            Write-Host "   Usando challenge existente: $challengeId" -ForegroundColor Green
        } else {
            Write-Host "   No hay challenges disponibles" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "   Error obteniendo challenges: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Paso 7: Asignar challenge a curso
Write-Host "7. Asignando challenge al curso..." -ForegroundColor Yellow

$assignChallengeBody = @{
    challengeId = $challengeId
} | ConvertTo-Json

try {
    $assignChallengeResponse = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/challenges" -Method POST -Body $assignChallengeBody -Headers $headers
    Write-Host "   Challenge asignado al curso" -ForegroundColor Green
} catch {
    Write-Host "   Challenge ya asignado o error: $_" -ForegroundColor Yellow
}

Write-Host ""

# Paso 8: Crear evaluacion
Write-Host "8. Creando evaluacion..." -ForegroundColor Yellow

$startDate = (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ssZ")
$endDate = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ssZ")

$evaluationBody = @{
    name = "Parcial 1 - Estructuras de Datos"
    startDate = $startDate
    endDate = $endDate
    duration = 90
    maxAttempts = 3
    challengeIds = @($challengeId)
    courseIds = @($courseId)
} | ConvertTo-Json

try {
    $evaluationResponse = Invoke-RestMethod -Uri "$baseUrl/evaluations" -Method POST -Body $evaluationBody -Headers $headers
    $evaluationId = $evaluationResponse.id
    Write-Host "   Evaluacion creada: $($evaluationResponse.name) (ID: $evaluationId)" -ForegroundColor Green
    Write-Host "   Estado: $($evaluationResponse.status)" -ForegroundColor Cyan
} catch {
    Write-Host "   Error creando evaluacion: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 9: Estudiante ve evaluaciones
Write-Host "9. Estudiante consulta evaluaciones..." -ForegroundColor Yellow

$studentHeaders = @{
    Authorization = "Bearer $studentToken"
}

try {
    $studentEvaluations = Invoke-RestMethod -Uri "$baseUrl/evaluations" -Method GET -Headers $studentHeaders
    Write-Host "   Evaluaciones disponibles: $($studentEvaluations.Count)" -ForegroundColor Green
    if ($studentEvaluations.Count -gt 0) {
        Write-Host "   Primera evaluacion: $($studentEvaluations[0].name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   Error obteniendo evaluaciones: $_" -ForegroundColor Red
}

Write-Host ""

# Paso 10: Estudiante ve detalles de evaluacion
Write-Host "10. Estudiante ve detalles de evaluacion..." -ForegroundColor Yellow

try {
    $evaluationDetails = Invoke-RestMethod -Uri "$baseUrl/evaluations/$evaluationId" -Method GET -Headers $studentHeaders
    Write-Host "   Evaluacion: $($evaluationDetails.name)" -ForegroundColor Green
    Write-Host "   Retos: $($evaluationDetails.challenges.Count)" -ForegroundColor Cyan
    Write-Host "   Puede enviar: $($evaluationDetails.canSubmit)" -ForegroundColor Cyan
} catch {
    Write-Host "   Error obteniendo detalles: $_" -ForegroundColor Red
}

Write-Host ""

# Paso 11: Estudiante envia solucion
Write-Host "11. Estudiante envia solucion..." -ForegroundColor Yellow

$submissionCode = "n = int(input())`nprint(sum(range(1, n+1)))"
$submissionBodyObj = @{
    challengeId = $challengeId
    language = "python"
    code = $submissionCode
}
$submissionBodyJson = $submissionBodyObj | ConvertTo-Json -Depth 10

try {
    $submissionResponse = Invoke-RestMethod -Uri "$baseUrl/submissions" -Method POST -Body $submissionBodyJson -Headers $studentHeaders -ContentType "application/json"
    $submissionId = $submissionResponse.id
    Write-Host "   Submission creado: $submissionId" -ForegroundColor Green
    Write-Host "   Estado inicial: $($submissionResponse.status)" -ForegroundColor Cyan
    
    Write-Host "   Esperando procesamiento (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} catch {
    Write-Host "   Error creando submission: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host "   Body enviado: $submissionBodyJson" -ForegroundColor Yellow
    $submissionId = $null
}

Write-Host ""

# Paso 12: Estudiante consulta estado
Write-Host "12. Estudiante consulta estado de submission..." -ForegroundColor Yellow

if ($submissionId) {
    try {
        $submissionStatus = Invoke-RestMethod -Uri "$baseUrl/submissions/$submissionId" -Method GET -Headers $studentHeaders
        Write-Host "   Estado: $($submissionStatus.status)" -ForegroundColor Green
        if ($submissionStatus.result) {
            if ($submissionStatus.result -is [PSCustomObject]) {
                Write-Host "   Puntaje: $($submissionStatus.result.score)" -ForegroundColor Cyan
                Write-Host "   Tiempo: $($submissionStatus.result.timeMsTotal) ms" -ForegroundColor Cyan
            } elseif ($submissionStatus.result -is [string]) {
                $resultObj = $submissionStatus.result | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($resultObj) {
                    Write-Host "   Puntaje: $($resultObj.score)" -ForegroundColor Cyan
                    Write-Host "   Tiempo: $($resultObj.timeMsTotal) ms" -ForegroundColor Cyan
                } else {
                    Write-Host "   Resultado: $($submissionStatus.result)" -ForegroundColor Cyan
                }
            } else {
                Write-Host "   Resultado: $($submissionStatus.result | ConvertTo-Json -Compress)" -ForegroundColor Cyan
            }
        } else {
            Write-Host "   Aun procesando..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   Error consultando submission: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   No se pudo crear submission, saltando consulta" -ForegroundColor Yellow
}

Write-Host ""

# Paso 13: Profesor ve resultados
Write-Host "13. Profesor consulta resultados de evaluacion..." -ForegroundColor Yellow

$professorHeaders = @{
    Authorization = "Bearer $professorToken"
}

try {
    $results = Invoke-RestMethod -Uri "$baseUrl/evaluations/$evaluationId/results" -Method GET -Headers $professorHeaders
    Write-Host "   Evaluacion: $($results.evaluationName)" -ForegroundColor Green
    Write-Host "   Estudiantes evaluados: $($results.results.Count)" -ForegroundColor Cyan
    foreach ($result in $results.results) {
        Write-Host "   - $($result.studentEmail): $($result.totalScore) puntos" -ForegroundColor Yellow
        foreach ($challengeResult in $result.challengeResults) {
            Write-Host "     * $($challengeResult.challengeTitle): $($challengeResult.bestScore) puntos ($($challengeResult.attemptCount) intentos)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   Error obteniendo resultados: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== PRUEBA COMPLETA FINALIZADA ===" -ForegroundColor Green

