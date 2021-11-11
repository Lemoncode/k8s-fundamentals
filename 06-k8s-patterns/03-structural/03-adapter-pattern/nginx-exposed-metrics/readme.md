# Nginx Exposed Metrics

Create `default.conf`

```conf
server {
    listen      80;
    server_name localhost;
    
    location / {
        root  /usr/share/nginx/html;
        index index.html index.htm;
    }
    
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root   /usr/share/nginx.html
    }

    location /nginx_status {
        stub_status;
        allow 127.0.0.1; # 1
        deny all; # 2
    }
}

```

1. Allow requests on `localhost`
2. Deny everything else.

`Nginx` exposes its own metrics on `/nginx_status`, here we're allowing calls from `127.0.0.1` and rejectiing every thing else.

Create `Dockerfile`

```Dockerfile
FROM nginx:1.20.1

RUN apt-get update 
RUN apt-get install -y curl

COPY default.conf /etc/nginx/conf.d/default.conf
```

For last publish the image:

```bash
./dockerize.sh "your_docker_username/nginx-exposed-metrics"
```
