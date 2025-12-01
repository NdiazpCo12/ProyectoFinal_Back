Write-Host "=== Construyendo imagenes Docker para workers ===" -ForegroundColor Cyan

Write-Host "`nConstruyendo worker-python..." -ForegroundColor Yellow
docker build -t worker-python:latest ./workers/worker_python

Write-Host "`nConstruyendo worker-java..." -ForegroundColor Yellow
docker build -t worker-java:latest ./workers/worker_java

Write-Host "`nConstruyendo worker-node..." -ForegroundColor Yellow
docker build -t worker-node:latest ./workers/worker_node

Write-Host "`nConstruyendo worker-cpp..." -ForegroundColor Yellow
docker build -t worker-cpp:latest ./workers/worker_c++

Write-Host "`n=== Aplicando configuraciones de Kubernetes ===" -ForegroundColor Cyan

Write-Host "`nAplicando servicios..." -ForegroundColor Yellow
kubectl apply -f k8s/service-redis.yaml
kubectl apply -f k8s/service-db.yaml

Write-Host "`nAplicando deployments..." -ForegroundColor Yellow
kubectl apply -f k8s/deployment-worker-python.yaml
kubectl apply -f k8s/deployment-worker-java.yaml
kubectl apply -f k8s/deployment-worker-node.yaml
kubectl apply -f k8s/deployment-worker-cpp.yaml

Write-Host "`nAplicando ScaledObjects de KEDA..." -ForegroundColor Yellow
kubectl apply -f k8s/scaledobject-worker-python.yaml
kubectl apply -f k8s/scaledobject-worker-java.yaml
kubectl apply -f k8s/scaledobject-worker-node.yaml
kubectl apply -f k8s/scaledobject-worker-cpp.yaml

Write-Host "`n=== Verificando estado ===" -ForegroundColor Cyan
kubectl get deployments -n runners
kubectl get scaledobjects -n runners
kubectl get pods -n runners

Write-Host "`n=== Despliegue completado ===" -ForegroundColor Green

