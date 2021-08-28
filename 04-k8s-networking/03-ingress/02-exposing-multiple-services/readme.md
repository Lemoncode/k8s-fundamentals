# Exposing multiple services

>NOTE: We start from previous [DEMO - exposing a single service](04-k8s-networking/99-ingress/01-exposing-single-service)

## Steps

### Let's create two additional services

```bash
kubectl create deployment hello-world-service-blue --image=gcr.io/google-samples/hello-app:1.0
kubectl create deployment hello-world-service-red  --image=gcr.io/google-samples/hello-app:1.0

kubectl expose deployment hello-world-service-blue --port=4343 --target-port=8080 --type=ClusterIP
kubectl expose deployment hello-world-service-red  --port=4242 --target-port=8080 --type=ClusterIP
```

Let's add an ingress with paths, each one routing to different backend service. Create `ingress-path.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-path
spec:
  rules:
  - host: path.example.com
    http:
      paths:
      - path: /red
        pathType: Prefix
        backend:
          service:
            name: hello-world-service-red
            port: 
              number: 4242
      - path: /blue
        pathType: Prefix
        backend:
          service:
            name: hello-world-service-blue
            port: 
              number: 4343

```


```bash
kubectl apply -f ingress-path.yaml
```

```bash
#We now have two, one for all hosts and the other for our defined host with two paths
#The Ingress controller is implementing these ingresses and we're sharing the one public IP, don't proceed until you see 
#the address populated for your ingress
kubectl get ingress --watch
NAME             CLASS    HOSTS              ADDRESS        PORTS   AGE
ingress-path     <none>   path.example.com   192.168.64.6   80      54s
ingress-single   <none>   *                  192.168.64.6   80      54m
```

```bash
#We can see the host, the path, and the backends.
kubectl describe ingress ingress-path
Name:             ingress-path
Namespace:        default
Address:          192.168.64.6
Default backend:  default-http-backend:80 (<error: endpoints "default-http-backend" not found>)
Rules:
  Host              Path  Backends
  ----              ----  --------
  path.example.com  
                    /red    hello-world-service-red:4242 (172.17.0.7:8080)
                    /blue   hello-world-service-blue:4343 (172.17.0.6:8080)
Annotations:        <none>
Events:
  Type    Reason  Age                 From                      Message
  ----    ------  ----                ----                      -------
  Normal  Sync    92s (x2 over 2m8s)  nginx-ingress-controller  Scheduled for sync
```

```bash
#Our ingress on all hosts is still routing to service single, since we're accessing the URL with an IP and not a domain name or host header.
$ curl 192.168.64.6/red
Hello, world!
Version: 1.0.0
Hostname: hello-world-service-single-6c58c555f8-k2whh
```

```bash
#Our paths are routing to their correct services, if we specify a host header or use a DNS name to access the ingress. That's how the rule will route the request.
curl http://$INGRESSIP/red  --header 'Host: path.example.com'
curl http://$INGRESSIP/blue --header 'Host: path.example.com'
```

```bash
$ curl http://192.168.64.6/red --header 'Host: path.example.com'
Hello, world!
Version: 1.0.0
Hostname: hello-world-service-red-85b6d9bfbc-29d57
$ curl http://192.168.64.6/blue --header 'Host: path.example.com'
Hello, world!
Version: 1.0.0
Hostname: hello-world-service-blue-7f9fb4f798-l6xj5
```

```bash
#If we don't specify a path we'll get a 404 while specifying a host header. 
#We'll need to configure a path and backend for / or define a default backend for the service
curl http://$INGRESSIP/     --header 'Host: path.example.com'
```

```bash
$ curl http://192.168.64.6/ --header 'Host: path.example.com'
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

Let's create `ingress-path-backend.yaml` to fix the previous situation

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-path
spec:
  rules:
  - host: path.example.com
    http:
      paths:
      - path: /red
        pathType: Prefix
        backend:
          service:
            name: hello-world-service-red
            port: 
              number: 4242
      - path: /blue
        pathType: Prefix
        backend:
          service:
            name: hello-world-service-blue
            port: 
              number: 4343
  defaultBackend:
    service:
        name: hello-world-service-single
        port:
            number: 80
```

```bash
#Let's add a backend to the ingress listenting on path.example.com pointing to the single service
kubectl apply -f ingress-path-backend.yaml
```

```bash
#We can see the default backend, and in the Rules, the host, the path, and the backends.
kubectl describe ingress ingress-path
Name:             ingress-path
Namespace:        default
Address:          192.168.64.6
Default backend:  hello-world-service-single:80 (172.17.0.4:8080,172.17.0.5:8080)
Rules:
  Host              Path  Backends
  ----              ----  --------
  path.example.com  
                    /red    hello-world-service-red:4242 (172.17.0.7:8080)
                    /blue   hello-world-service-blue:4343 (172.17.0.6:8080)
Annotations:        <none>
Events:
  Type    Reason  Age                From                      Message
  ----    ------  ----               ----                      -------
  Normal  Sync    57s (x3 over 28m)  nginx-ingress-controller  Scheduled for sync
```

```bash
#Now we'll hit the default backend service, single
curl http://$INGRESSIP/ --header 'Host: path.example.com'
```

```bash
curl http://192.168.64.6/ --header 'Host: path.example.com'
Hello, world!
Version: 1.0.0
Hostname: hello-world-service-single-6c58c555f8-8rrcm
```
