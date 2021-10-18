## Building Docker Image

```bash
docker build -t jaimesalas/reverse-proxy-payroll .
```

## Running the Image

```bash
docker run --rm -d \
  --name reverse \
  -p 80:80 \
  jaimesalas/reverse-proxy-payroll
```

## Debugging conf on host

```bash
docker run -d --name reverse \
    --name reverse \
    --network payroll-net \
    -v `pwd`/nginx.conf:/etc/nginx/nginx.conf \
    -p 80:80 \
    nginx
```

## Building and Publishing image

```bash
./build-push.sh "jaimesalas/reverse-proxy-payroll"
```
