# Script para probar el flujo completo de submission
# 1. Login como profesor
# 2. Crear curso y challenge
# 3. Login como estudiante
# 4. Hacer submission
# 5. Verificar que el profesor puede ver los resultados

$baseUrl = "http://localhost:3000"

Write-Host "=== PRUEBA DE FLUJO DE SUBMISSION ===" -ForegroundColor Green
Write-Host ""

# 1. Login como profesor
Write-Host "1. Login como profesor..." -ForegroundColor Cyan
$professorLogin = @{
    email = "profesor@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $professorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $professorLogin -ContentType "application/json"
    $professorToken = $professorResponse.access_token
    $professorHeaders = @{
        "Authorization" = "Bearer $professorToken"
        "Content-Type" = "application/json"
    }
    Write-Host "   Profesor autenticado" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Crear curso
Write-Host "2. Creando curso..." -ForegroundColor Cyan
$nrc = "TEST" + (Get-Random -Minimum 1000 -Maximum 9999)
$courseBody = @{
    name = "Test Submission Course"
    nrc = $nrc
    period = "2025-1"
    group = 1
} | ConvertTo-Json

try {
    $course = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Headers $professorHeaders -Body $courseBody -ContentType "application/json"
    $courseId = $course.id
    Write-Host "   Curso creado: $($course.name) (ID: $courseId)" -ForegroundColor Green
} catch {
    Write-Host "   Error creando curso: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Crear challenge
Write-Host "3. Creando challenge..." -ForegroundColor Cyan
$challengeBody = @{
    title = "Suma Simple"
    description = "Suma dos numeros"
    difficulty = "EASY"
    tags = @("math", "basic")
    timeLimit = 1000
    memoryLimit = 128
    testCases = @(
        @{
            input = "2 3"
            expectedOutput = "5"
            isHidden = $false
        },
        @{
            input = "10 20"
            expectedOutput = "30"
            isHidden = $true
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $challenge = Invoke-RestMethod -Uri "$baseUrl/challenges" -Method POST -Headers $professorHeaders -Body $challengeBody -ContentType "application/json"
    $challengeId = $challenge.id
    Write-Host "   Challenge creado: $($challenge.title) (ID: $challengeId)" -ForegroundColor Green
} catch {
    Write-Host "   Error creando challenge: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Asignar challenge al curso
Write-Host "4. Asignando challenge al curso..." -ForegroundColor Cyan
$assignBody = @{
    challengeId = $challengeId
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/challenges" -Method POST -Headers $professorHeaders -Body $assignBody -ContentType "application/json" | Out-Null
    Write-Host "   Challenge asignado al curso" -ForegroundColor Green
} catch {
    Write-Host "   Error asignando challenge: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Login como estudiante
Write-Host "5. Login como estudiante..." -ForegroundColor Cyan
$studentLogin = @{
    email = "estudiante@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $studentLogin -ContentType "application/json"
    $studentToken = $studentResponse.access_token
    $studentId = $studentResponse.user.id
    $studentHeaders = @{
        "Authorization" = "Bearer $studentToken"
        "Content-Type" = "application/json"
    }
    Write-Host "   Estudiante autenticado (ID: $studentId)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Inscribir estudiante al curso
Write-Host "6. Inscribiendo estudiante al curso..." -ForegroundColor Cyan
$enrollBody = @{
    studentId = $studentId
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" -Method POST -Headers $professorHeaders -Body $enrollBody -ContentType "application/json" | Out-Null
    Write-Host "   Estudiante inscrito" -ForegroundColor Green
} catch {
    Write-Host "   Error inscribiendo estudiante: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Estudiante hace submission
Write-Host "7. Estudiante hace submission..." -ForegroundColor Cyan
$submissionBody = @{
    challengeId = $challengeId
    language = "python"
    code = "a, b = map(int, input().split())`nprint(a + b)"
} | ConvertTo-Json

try {
    $submission = Invoke-RestMethod -Uri "$baseUrl/submissions" -Method POST -Headers $studentHeaders -Body $submissionBody -ContentType "application/json"
    $submissionId = $submission.id
    Write-Host "   Submission creado: $submissionId" -ForegroundColor Green
    Write-Host "   Estado inicial: $($submission.status)" -ForegroundColor Yellow
} catch {
    Write-Host "   Error creando submission: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Detalles: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# 8. Esperar procesamiento
Write-Host "8. Esperando procesamiento (10 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# 9. Verificar estado del submission
Write-Host "9. Verificando estado del submission..." -ForegroundColor Cyan
try {
    $submissionStatus = Invoke-RestMethod -Uri "$baseUrl/submissions/$submissionId" -Method GET
    Write-Host "   Estado: $($submissionStatus.status)" -ForegroundColor Green
    if ($submissionStatus.result) {
        Write-Host "   Resultado: $($submissionStatus.result | ConvertTo-Json -Compress)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error obteniendo submission: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Profesor ve submission (si hay endpoint)
Write-Host "10. Verificando que el profesor puede ver submissions..." -ForegroundColor Cyan
try {
    $submissions = Invoke-RestMethod -Uri "$baseUrl/submissions" -Method GET -Headers $professorHeaders -ErrorAction SilentlyContinue
    if ($submissions) {
        Write-Host "   Submissions encontrados: $($submissions.Count)" -ForegroundColor Green
    }
} catch {
    Write-Host "   Nota: No hay endpoint para listar submissions (esto es normal)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== PRUEBA COMPLETADA ===" -ForegroundColor Green
Write-Host "Submission ID: $submissionId" -ForegroundColor Cyan
Write-Host "Verifica los logs de los workers para confirmar el procesamiento" -ForegroundColor Yellow

