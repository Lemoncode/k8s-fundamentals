#!/bin/bash
docker network create payroll-net || true

echo "starting redis"
docker run --rm -d \
  --name cache \
  --network payroll-net \
  redis:6.2.5

echo "starting payroll-api"
docker run --rm -d \
  --name payrollapi \
  -e PORT="3000" \
  -e REDIS_PORT="6379" \
  -e REDIS_HOST="cache" \
  -e CACHE_ENABLED="true" \
  --network payroll-net \
  jaimesalas/payroll-api

echo "starting payroll-front"
docker run --rm -d \
  --name payrollfront \
  --network payroll-net \
  jaimesalas/payroll-front

echo "starting payroll reverse proxy"
docker run -d \
  --name reverse \
  --network payroll-net \
  -p 80:80 \
  jaimesalas/reverse-proxy-payroll