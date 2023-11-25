# The Adapter Pattern

Before start create image from [nginx-exposed-metrics](./nginx-exposed-metrics/readme.md)

## Use case 

We build our micro services on any language, with its own interfaces and APIs. The problem is that the tools that we're using don't expose the data on the right format that other tools and applications consume it.

For example `Prometheus`, expects metrics in a certain format, that usually is not the format of our applications. 

The recommended pattern to deal with this on Kubernetes is to use the `adapter sidecar pattern container`.

In the case of `Prometheus`, the `adapter` runs side by side to the application container, it scrapes the metrics coming out of your app and then transforms them into the format that `Prometheus` understands. 

## Steps

Create `adapter.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
spec:
  containers:
  - name: web-ctr
    image: jaimesalas/nginx-exposed-metrics
    imagePullPolicy: Always
    resources: {}
    ports:
      - containerPort: 80
  - name: adapter
    image: nginx/nginx-prometheus-exporter
    imagePullPolicy: Always
    resources: {}
    args: ["-nginx.scrape-uri", "http://localhost/nginx_status"]
    ports:
    - containerPort: 9113

```

The app container is an `NGINX`, its configuration file looks like:

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
        root   /usr/share/nginx.html;
    }
    location /nginx_status {
        stub_status;
        allow 127.0.0.1; 
        deny all;
    }
}
```

Notice that the route `/nginx_status` it's allowed to be accessed from `localhost` (127.0.0.1)


The other container is the `adpter` (we can use `transformer` - transforms NGINX metrics into Prometheus metrics)

```yaml
- name: adapter
  image: nginx/nginx-prometheus-exporter
  args: ["-nginx.scrape-uri", "http://localhost/nginx_status"]
  ports:
  - containerPort: 9113
```

This `transformer` is going to grab the `NGINX` metrics, in their native format, transform them and expose them on `/metrics` on port `9113`.

Let's start this pod.

```bash
kubectl apply -f adapter.yaml
```

Now that the pod is running, let's access to the container application:

> NOTE: We can do this, because it was declared the first one on the containers list, and K8s, will treat it as the default one. Rule of thumb, dedclare the main container always the first one.

```bash
kubectl exec -it web -- /bin/bash
```

```
Defaulted container "web-ctr" out of: web-ctr, transformer
```

Let's see the raw logs exposed by `NGINX`

```bash
root@web:/# curl localhost/nginx_status
Active connections: 1 
server accepts handled requests
 2 2 2 
Reading: 0 Writing: 1 Waiting: 0 
root@web:/# 
```

If we run this several time, we will see the numbers increasing:

```bash
root@web:/# curl localhost/nginx_status
Active connections: 1 
server accepts handled requests
 3 3 3 
Reading: 0 Writing: 1 Waiting: 0 
root@web:/# curl localhost/nginx_status
Active connections: 1 
server accepts handled requests
 4 4 4 
Reading: 0 Writing: 1 Waiting: 0 
root@web:/# curl localhost/nginx_status
Active connections: 1 
server accepts handled requests
 5 5 5 
Reading: 0 Writing: 1 Waiting: 0 
root@web:/# 
```

Remember tha `Prometheus` can't read this, for `Prometheus`, we have the adapter container listening on `localhost:9113/metrics`

```bash
root@web:/# curl localhost:9113/metrics
# HELP nginx_connections_accepted Accepted client connections
# TYPE nginx_connections_accepted counter
nginx_connections_accepted 6
# HELP nginx_connections_active Active client connections
# TYPE nginx_connections_active gauge
nginx_connections_active 1
# HELP nginx_connections_handled Handled client connections
# TYPE nginx_connections_handled counter
nginx_connections_handled 6
# HELP nginx_connections_reading Connections where NGINX is reading the request header
# TYPE nginx_connections_reading gauge
nginx_connections_reading 0
# HELP nginx_connections_waiting Idle client connections
# TYPE nginx_connections_waiting gauge
nginx_connections_waiting 0
# HELP nginx_connections_writing Connections where NGINX is writing the response back to the client
# TYPE nginx_connections_writing gauge
nginx_connections_writing 1
# HELP nginx_http_requests_total Total http requests
# TYPE nginx_http_requests_total counter
nginx_http_requests_total 6
# HELP nginx_up Status of the last metric scrape
# TYPE nginx_up gauge
nginx_up 1
# HELP nginxexporter_build_info Exporter build information
# TYPE nginxexporter_build_info gauge
nginxexporter_build_info{commit="5f88afbd906baae02edfbab4f5715e06d88538a0",date="2021-03-22T20:16:09Z",version="0.9.0"} 1
```

## Cleanup

```bash
kubectl delete -f ./
```
