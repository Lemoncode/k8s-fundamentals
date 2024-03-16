#!/bin/bash
docker network create payroll-net || true

echo "starting payroll-api"
docker run --rm -d \
  --name payrollapi \
  --network payroll-net \
  jaimesalas/payroll-api

#IMPORTANT: Use an image with API_MOCK set to false
echo "starting payroll-front"
docker run --rm -d \
  --name payrollfront \
  --network payroll-net \
  jaimesalas/payroll-front

echo "starting payroll reverse proxy"
docker run --rm -d \
  --name reverse \
  --network payroll-net \
  -p 80:80 \
  jaimesalas/reverse-proxy-payroll
