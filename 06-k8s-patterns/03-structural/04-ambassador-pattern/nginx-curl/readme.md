# NGINX curl

A simple NGINX image with `curl` binary installed

```Dockerfile
FROM nginx:1.20.1

RUN apt-get update 
RUN apt-get install -y curl
```

Build and push the image

```bash
./dockerize.sh "<your_docker_hub_user>/nginx-curl"
```
