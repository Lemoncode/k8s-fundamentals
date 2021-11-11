# NGINX Ambassador

Run as a `proxy` sending traffic to a custom back at **lc-ambassador**

> The container will **fail** if it doesn't find the DNS `lc-ambassador`

Create `nginx.conf`

```conf
worker_process 1;
worker_rlimit_nofile 4096;
events {
    worker_connections 512;
}
http {
    upstream backend {
        server lc-ambassador;
    }
    server {
        listen 9000;
        location / {
            proxy_pass http://backend;
        }
    }
}

```

Create `Dockerfile`

```Dockerfile
FROM nginx:1.20.1

COPY nginx.conf /etc/nginx/nginx.conf
```

Build the image and push to Docker Hub

```bash
./dockerize.sh "<your_docker_hub_user>/nginx-ambassador"
```
