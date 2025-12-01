# Script para asociar estudiante con challenge
$baseUrl = "http://localhost:3000"

Write-Host "=== CONFIGURANDO ESTUDIANTE Y CHALLENGE ===" -ForegroundColor Green
Write-Host ""

# 1. Login como admin
Write-Host "1. Autenticando como admin..." -ForegroundColor Cyan
$adminLogin = @{
    email = "admin@test.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    $adminToken = $adminResponse.access_token
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    Write-Host "   Admin autenticado" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Obtener estudiante
Write-Host "2. Obteniendo estudiante..." -ForegroundColor Cyan
$studentLogin = @{
    email = "student@test.com"
    password = "student123"
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $studentLogin -ContentType "application/json"
    $studentId = $studentResponse.user.id
    Write-Host "   Estudiante encontrado: $($studentResponse.user.email) (ID: $studentId)" -ForegroundColor Green
} catch {
    Write-Host "   Error obteniendo estudiante: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Obtener o crear curso
Write-Host "3. Obteniendo curso..." -ForegroundColor Cyan
try {
    $courses = Invoke-RestMethod -Uri "$baseUrl/courses" -Method GET -Headers $adminHeaders
    if ($courses.Count -gt 0) {
        $course = $courses[0]
        $courseId = $course.id
        Write-Host "   Curso encontrado: $($course.name) (ID: $courseId)" -ForegroundColor Green
    } else {
        Write-Host "   Creando nuevo curso..." -ForegroundColor Yellow
        $nrc = "TEST" + (Get-Random -Minimum 1000 -Maximum 9999)
        $courseBody = @{
            name = "Curso de Prueba"
            nrc = $nrc
            period = "2025-1"
            group = 1
        } | ConvertTo-Json
        $course = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Headers $adminHeaders -Body $courseBody -ContentType "application/json"
        $courseId = $course.id
        Write-Host "   Curso creado: $($course.name) (ID: $courseId)" -ForegroundColor Green
    }
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Inscribir estudiante al curso
Write-Host "4. Inscribiendo estudiante al curso..." -ForegroundColor Cyan
$enrollBody = @{
    studentId = $studentId
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" -Method POST -Headers $adminHeaders -Body $enrollBody -ContentType "application/json" | Out-Null
    Write-Host "   Estudiante inscrito en el curso" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   Estudiante ya estaba inscrito" -ForegroundColor Yellow
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Obtener o crear challenge
Write-Host "5. Obteniendo challenge..." -ForegroundColor Cyan
try {
    $challenges = Invoke-RestMethod -Uri "$baseUrl/challenges" -Method GET -Headers $adminHeaders
    if ($challenges.Count -gt 0) {
        $challenge = $challenges[0]
        $challengeId = $challenge.id
        Write-Host "   Challenge encontrado: $($challenge.title) (ID: $challengeId)" -ForegroundColor Green
    } else {
        Write-Host "   Creando nuevo challenge..." -ForegroundColor Yellow
        $challengeBody = @{
            title = "Suma Simple"
            description = "Dados dos numeros, devuelve su suma"
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
        $challenge = Invoke-RestMethod -Uri "$baseUrl/challenges" -Method POST -Headers $adminHeaders -Body $challengeBody -ContentType "application/json"
        $challengeId = $challenge.id
        Write-Host "   Challenge creado: $($challenge.title) (ID: $challengeId)" -ForegroundColor Green
    }
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Asignar challenge al curso
Write-Host "6. Asignando challenge al curso..." -ForegroundColor Cyan
$assignBody = @{
    challengeId = $challengeId
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/challenges" -Method POST -Headers $adminHeaders -Body $assignBody -ContentType "application/json" | Out-Null
    Write-Host "   Challenge asignado al curso" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   Challenge ya estaba asignado" -ForegroundColor Yellow
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== CONFIGURACION COMPLETA ===" -ForegroundColor Green
Write-Host "Estudiante: student@test.com" -ForegroundColor Cyan
Write-Host "Curso ID: $courseId" -ForegroundColor Cyan
Write-Host "Challenge ID: $challengeId" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora puedes:" -ForegroundColor Yellow
Write-Host "1. Login como estudiante (student@test.com / student123)" -ForegroundColor White
Write-Host "2. Ver el challenge en /challenges o /courses/$courseId/challenges" -ForegroundColor White
Write-Host "3. Hacer submit de una solucion" -ForegroundColor White

