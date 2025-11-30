# Prueba exhaustiva de todos los endpoints del backend
$baseUrl = "http://localhost:3000"
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        $status = "OK"
        $details = "Success"
    } catch {
        $status = "ERROR"
        $details = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $details += " | " + $_.ErrorDetails.Message
        }
        $response = $null
    }
    
    $result = [PSCustomObject]@{
        Endpoint = $Name
        Method = $Method
        Status = $status
        Details = $details
    }
    $script:results += $result
    Write-Host "   $Name : $status" -ForegroundColor $(if ($status -eq "OK") { "Green" } else { "Red" })
    
    return $response
}

Write-Host "=== PRUEBA EXHAUSTIVA DE ENDPOINTS ===" -ForegroundColor Green
Write-Host ""

# 1. AUTH ENDPOINTS
Write-Host "1. PROBANDO ENDPOINTS DE AUTENTICACION..." -ForegroundColor Yellow

# Register Admin
$adminReg = Test-Endpoint -Name "POST /auth/register (Admin)" -Method "POST" -Url "$baseUrl/auth/register" -Body @{
    email = "testadmin@test.com"
    password = "admin123"
    role = "ADMIN"
}

# Register Student
$studentReg = Test-Endpoint -Name "POST /auth/register (Student)" -Method "POST" -Url "$baseUrl/auth/register" -Body @{
    email = "teststudent@test.com"
    password = "student123"
    role = "STUDENT"
}

# Login Admin
$adminLogin = Test-Endpoint -Name "POST /auth/login (Admin)" -Method "POST" -Url "$baseUrl/auth/login" -Body @{
    email = "testadmin@test.com"
    password = "admin123"
}
$adminToken = $adminLogin.access_token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# Login Student
$studentLogin = Test-Endpoint -Name "POST /auth/login (Student)" -Method "POST" -Url "$baseUrl/auth/login" -Body @{
    email = "teststudent@test.com"
    password = "student123"
}
$studentToken = $studentLogin.access_token
$studentHeaders = @{ Authorization = "Bearer $studentToken" }

Write-Host ""

# 2. CHALLENGES ENDPOINTS
Write-Host "2. PROBANDO ENDPOINTS DE CHALLENGES..." -ForegroundColor Yellow

# Create Challenge
$challenge = Test-Endpoint -Name "POST /challenges" -Method "POST" -Url "$baseUrl/challenges" -Headers $adminHeaders -Body @{
    title = "Test Challenge"
    description = "Test description"
    difficulty = "EASY"
    tags = @("test")
    timeLimit = 1000
    memoryLimit = 128
    testCases = @(
        @{ input = "5"; expectedOutput = "25"; isHidden = $false }
    )
}
$challengeId = $challenge.id

# Get Challenges
Test-Endpoint -Name "GET /challenges" -Method "GET" -Url "$baseUrl/challenges" -Headers $adminHeaders

# Get Challenge by ID
Test-Endpoint -Name "GET /challenges/:id" -Method "GET" -Url "$baseUrl/challenges/$challengeId" -Headers $adminHeaders

Write-Host ""

# 3. COURSES ENDPOINTS
Write-Host "3. PROBANDO ENDPOINTS DE CURSOS..." -ForegroundColor Yellow

# Create Course
$course = Test-Endpoint -Name "POST /courses" -Method "POST" -Url "$baseUrl/courses" -Headers $adminHeaders -Body @{
    name = "Test Course"
    nrc = "TEST" + (Get-Random -Minimum 1000 -Maximum 9999)
    period = "2025-1"
    group = 1
}
$courseId = $course.id

# Get Courses
Test-Endpoint -Name "GET /courses" -Method "GET" -Url "$baseUrl/courses" -Headers $adminHeaders

# Enroll Student
Test-Endpoint -Name "POST /courses/:id/enroll" -Method "POST" -Url "$baseUrl/courses/$courseId/enroll" -Headers $adminHeaders -Body @{
    studentId = $studentLogin.user.id
}

# Assign Professor
Test-Endpoint -Name "POST /courses/:id/professors" -Method "POST" -Url "$baseUrl/courses/$courseId/professors" -Headers $adminHeaders -Body @{
    professorId = $adminLogin.user.id
}

# Assign Challenge to Course
Test-Endpoint -Name "POST /courses/:id/challenges" -Method "POST" -Url "$baseUrl/courses/$courseId/challenges" -Headers $adminHeaders -Body @{
    challengeId = $challengeId
}

# Get Course Challenges
Test-Endpoint -Name "GET /courses/:id/challenges" -Method "GET" -Url "$baseUrl/courses/$courseId/challenges" -Headers $adminHeaders

Write-Host ""

# 4. EVALUATIONS ENDPOINTS
Write-Host "4. PROBANDO ENDPOINTS DE EVALUACIONES..." -ForegroundColor Yellow

# Create Evaluation
$startDate = (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ssZ")
$endDate = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ssZ")
$evaluation = Test-Endpoint -Name "POST /evaluations" -Method "POST" -Url "$baseUrl/evaluations" -Headers $adminHeaders -Body @{
    name = "Test Evaluation"
    startDate = $startDate
    endDate = $endDate
    duration = 90
    maxAttempts = 3
    challengeIds = @($challengeId)
    courseIds = @($courseId)
}
$evaluationId = $evaluation.id

# Get Evaluations (Admin)
Test-Endpoint -Name "GET /evaluations (Admin)" -Method "GET" -Url "$baseUrl/evaluations" -Headers $adminHeaders

# Get Evaluations (Student)
Test-Endpoint -Name "GET /evaluations (Student)" -Method "GET" -Url "$baseUrl/evaluations" -Headers $studentHeaders

# Get Evaluation Details (Student)
Test-Endpoint -Name "GET /evaluations/:id (Student)" -Method "GET" -Url "$baseUrl/evaluations/$evaluationId" -Headers $studentHeaders

# Get Evaluation Results (Admin)
Test-Endpoint -Name "GET /evaluations/:id/results" -Method "GET" -Url "$baseUrl/evaluations/$evaluationId/results" -Headers $adminHeaders

Write-Host ""

# 5. SUBMISSIONS ENDPOINTS
Write-Host "5. PROBANDO ENDPOINTS DE SUBMISSIONS..." -ForegroundColor Yellow

# Create Submission
$submission = Test-Endpoint -Name "POST /submissions" -Method "POST" -Url "$baseUrl/submissions" -Headers $studentHeaders -Body @{
    challengeId = $challengeId
    language = "python"
    code = "n = int(input())`nprint(n * n)"
}
$submissionId = $submission.id

# Wait for processing
Write-Host "   Esperando procesamiento (5 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Get Submission Status
Test-Endpoint -Name "GET /submissions/:id" -Method "GET" -Url "$baseUrl/submissions/$submissionId" -Headers $studentHeaders

Write-Host ""

# RESUMEN
Write-Host "=== RESUMEN DE PRUEBAS ===" -ForegroundColor Green
Write-Host ""
$okCount = ($results | Where-Object { $_.Status -eq "OK" }).Count
$errorCount = ($results | Where-Object { $_.Status -eq "ERROR" }).Count
$totalCount = $results.Count

Write-Host "Total de endpoints probados: $totalCount" -ForegroundColor Cyan
Write-Host "Exitosos: $okCount" -ForegroundColor Green
Write-Host "Con errores: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errorCount -gt 0) {
    Write-Host "Endpoints con errores:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "ERROR" } | ForEach-Object {
        Write-Host "  - $($_.Endpoint): $($_.Details)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Todos los endpoints funcionan correctamente!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Detalles por endpoint:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

