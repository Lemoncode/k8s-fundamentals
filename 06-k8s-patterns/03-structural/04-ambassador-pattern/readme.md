# Ambassador Pattern

Before star create images from [nginx-outside](./nginx-outside/readme.md), [nginx-ambassador](./nginx-ambassador/readme.md) and [nginx-curl](./nginx-curl/readme.md)

## Use case

Imagine that our main container it's running the application, and it does not care about all the different external systems that it might have to connect to. 

So to help with that, we can create an ambassador container that sits in between the main applications and the outside world and brokers connections. 

For example, the main app consumes an external API, maybe the details of that API can change from time to time, the address, port or the certificates... 

We don't want that our main app has to care about that, wn we don't want to update our main app because conection API changes

A Better solution is just to have your main app talk to a `localhost` port, and then the `ambassador` listen on that port. That way, any time you main app container makes a connection, the ambassador picks it up and does all this stuff required to make it work with the external API or whatever the external system is.

## Steps

Let's start by creating our external app, create `external.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: external-app
  labels:
    app: ambassador
spec:
  containers:
  - name: nginx-outside
    image: jaimesalas/nginx-outside
    imagePullPolicy: Always
    resources: {}
    ports:
      - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: lc-ambassador
spec:
  selector:
    app: ambassador
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer


```

Notice that this is not the main app or the ambassador, is just a an external API. This is just a web server accessible as `app: ambassador` on `port 80`. Let's deploy it and check it:

```bash
$ kubectl apply -f external.yaml
```

From another terminal run `minikube tunnel`. And we can find the IP, by running:

```bash
$ kubectl get svc
NAME            TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)        AGE
kubernetes      ClusterIP      10.96.0.1       <none>          443/TCP        59d
lc-ambassador   LoadBalancer   10.97.113.231   10.97.113.231   80:32123/TCP   98s
```

We can grab the IP, and test it in our local browser. What we're  going to do is that our main app reaches this web, via the `ambassador`.

Let's create a new pod that will deal with the external service throw the `ambassador` container, create `ambassador-app.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ambassador-app
spec:
  containers:
  - name: main-app
    image: jaimesalas/nginx-curl
    imagePullPolicy: Always
    resources: {}
    # command: ["sleep", "3600"] # 1
  - name: ambassador
    image: jaimesalas/nginx-ambassador
    imagePullPolicy: Always
    resources: {}

```

1. this line here in the code is just to keep it running while we log on and imitate the main app by running curl commands.

The `ambassador` container, is the one that will care about the outside world, its configuration:

```conf
worker_processes 1;
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

Notice that the `ambassador` is listening on port `9000`. Notice also that the `upstream` is pointing to `lc-ambassador`, by this service we reach the outer world. 

Recall that behinc the scenes the `external-app` is listening on port `80`. Our main app is ignoring that, and access via `ambassador` on `localhost:9000`.

Let's deploy `ambassador-app`

```bash
$ kubectl apply -f ambassador-app.yaml
```

And access the container app:

```bash
$ kubectl exec -it ambassador-app -c main-app -- /bin/bash
```

And access the external service by running:

```bash
root@ambassador-app:/# curl localhost:9000
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OUTSIDE</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0 auto;
            text-align: center;
            width: 500px;
            background-color: lightpink;
            color: white;
        }
    </style>
</head>
<body>
    <h1>A foreign place!</h1>
</body>
</html>
```
