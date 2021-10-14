# Installing a Helm Chart

From `./chart` run:

```bash
helm install demo todos
```

We get an output similar to this:

```
NAME: demo
LAST DEPLOYED: Thu Oct 14 20:44:16 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

Helm reads the chart and asks K8s API to create a release. We can check the new K8s objects by running:

```bash
kubectl get all
```

We get similar to this:

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/frontend-74d9b9ddcd-7kgwp   1/1     Running   0          2m1s

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/frontend     ClusterIP   10.97.251.106   <none>        80/TCP    2m1s
service/kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP   53d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/frontend   1/1     1            1           2m1s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/frontend-74d9b9ddcd   1         1         1       2m1s
```

To check out that ingress is working, we can use:

```bash
INGRESSIP=$(kubectl get ingress -o json | jq -r '.items[0].status.loadBalancer.ingress[0].ip') 
```

```bash
curl http://$INGRESSIP/ --header 'Host: frontend.minikube.local'
```

We get an output similar to this:

```
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


We can also use Helm to check what's going on:

```bash
helm list --short
demo
```

```bash
helm get manifest demo
---
# Source: todos/templates/frontend-service.yaml
apiVersion: v1
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
---
# Source: todos/templates/frontend.yaml
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
---
# Source: todos/templates/ingress.yaml
# ....
```