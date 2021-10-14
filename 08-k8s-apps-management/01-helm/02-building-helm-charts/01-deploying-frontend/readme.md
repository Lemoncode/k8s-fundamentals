# Deploying Frontend

## Steps

### 1. Creating directory structure

In this demo we're going to create the basic infrastructure to work with Helm charts, create a new directory on root named `app` and copy inside it `00-start-code/todo-app-frontend`

```
app/
├─ todo-app-frontend
```

To simplify naming and paths, rename `app/todo-app-frontend` to `app/frontend`

```
app/
├─ frontend/
```

### 2. Creating manifests

Now let's create a new directory, `yaml`, that will contain the manifests to deploy our frontend application.

```
app/
├─ frontend/
├─ yaml/
```

Create `frontend.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend-ctr
          image: jaimesalas/todo-app-frontend:0.1.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: frontend
              containerPort: 8080
          resources: {}

``` 

Create `frontend-service.yaml`

```yaml
apiVersion: apps/v1
kind: Service
metadata:
  labels:
    name: frontend
  name: frontend
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 8080

```


Create `ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
spec:
  rules:
    - host: frontend.minikube.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80

```

Before running running the scripts, lets build the necessary image, `cd` into `app/frontend` and run:

```bash
./dockerize.sh "jaimesalas/todo-app-frontend:0.1.0" 
```

And push to the remote repository

```bash
docker push jaimesalas/todo-app-frontend:0.1.0
```

Now we can deploy the obejects into the K8s cluster as follows, `cd` into `app/yaml` and run:

```bash
kubectl apply -f frontend.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f ingress.yaml
```

If we run `kubectl get all`,  we must see similar to this:

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/frontend-74d9b9ddcd-zvwjd   1/1     Running   0          90s

NAME                 TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
service/frontend     ClusterIP   10.96.24.128   <none>        80/TCP    15m
service/kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP   53d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/frontend   1/1     1            1           90s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/frontend-74d9b9ddcd   1         1         1       90s
```

Check the ingress is up:

```bash
kubectl get ingress
NAME           CLASS    HOSTS                     ADDRESS        PORTS   AGE
todo-ingress   <none>   frontend.minikube.local   192.168.49.2   80      24m
```

And we can check is working by running:

```bash
curl http://192.168.49.2 --header "Host: frontend.minikube.local"
```

Giving us the following output:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Awesome Todo App </title>
  <script defer src="app.75041a9c72b5e5a3b92f.js"></script></head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### Clean up

```bash
kubectl delete -f frontend.yaml
kubectl delete -f frontend-service.yaml
kubectl delete -f ingress.yaml
```