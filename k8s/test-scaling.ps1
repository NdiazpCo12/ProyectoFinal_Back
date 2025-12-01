Write-Host "=== Prueba de escalado con KEDA ===" -ForegroundColor Cyan

Write-Host "`n1. Estado inicial de los pods..." -ForegroundColor Yellow
kubectl get pods -n runners -l app=worker-python
kubectl get pods -n runners -l app=worker-java
kubectl get pods -n runners -l app=worker-node
kubectl get pods -n runners -l app=worker-cpp

Write-Host "`n2. Estado de las colas en Redis..." -ForegroundColor Yellow
docker exec redis redis-cli LLEN "bull:submissions-python:wait"
docker exec redis redis-cli LLEN "bull:submissions-java:wait"
docker exec redis redis-cli LLEN "bull:submissions-node:wait"
docker exec redis redis-cli LLEN "bull:submissions-cpp:wait"

Write-Host "`n3. Para probar el escalado:" -ForegroundColor Green
Write-Host "   - Envia submissions a traves de la API" -ForegroundColor White
Write-Host "   - KEDA monitoreara las colas y escalara automaticamente" -ForegroundColor White
Write-Host "   - Verifica con: kubectl get pods -n runners -w" -ForegroundColor White

Write-Host "`n4. Monitoreo continuo (Ctrl+C para salir):" -ForegroundColor Yellow
Write-Host "   kubectl get pods -n runners -w" -ForegroundColor Gray

