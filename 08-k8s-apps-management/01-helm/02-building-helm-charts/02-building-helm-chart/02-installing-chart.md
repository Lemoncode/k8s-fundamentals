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

Now imagine that a minor change happen on our application and DevOps team is going to release a new version. 

Build and push a new frontend application version, `cd` into `./app/frontend`

```bash
./dockerize.sh "jaimesalas/todo-app-frontend:0.1.1"
```

```bash
docker push jaimesalas/todo-app-frontend:0.1.1
```

So we have to modify `./chart/todos/Chart.yaml`

```diff
apiVersion: v2
name: todos
-appVersion: "1.0"
+appVersion: "1.1"
-description: A Helm Chart for Todos Awesome App
+description: A Helm Chart for Todos Awesome App 1.1
version: 0.1.0
type: application
```

Updates the `appVersion` and the `description`, but they don't update `version` because nothing inside the chart has been changed.

Also they update the image definition on `./chart/todos/templates/frontend.yaml`

```diff
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
-         image: jaimesalas/todo-app-frontend:0.1.0
+         image: jaimesalas/todo-app-frontend:0.1.1
          imagePullPolicy: IfNotPresent
          ports:
            - name: frontend
              containerPort: 8080
          resources: {}

```

To upgrade the release now we can run:

```bash
helm upgrade demo todos
```

We get an output similar to:

```
Release "demo" has been upgraded. Happy Helming!
NAME: demo
LAST DEPLOYED: Fri Oct 15 10:45:59 2021
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

To check that the new image is used we can run:

```bash
kubectl describe pod -l app=frontend
```
 We cand find the new image version:

```
# .....
Containers:
  frontend-ctr:
    Container ID:   docker://2302d94ffa0444f00e7c770190f6f1632d559e2a89d501c007ddaf9c07f939fe
    Image:          jaimesalas/todo-app-frontend:0.1.1
# .....
```

We can check that is the second revision:

```bash
helm status demo
```

We get 

```
NAME: demo
LAST DEPLOYED: Fri Oct 15 10:45:59 2021
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None 
```

Now imagine there is a bug on the release and we have to rollback, we can do this by:

```bash
helm rollback demo 1
```

* **demo** - the name of the release
* **1** - the version number to rollback

To see all the history changes

```bash
helm history demo
```

We get 

```
REVISION        UPDATED                         STATUS          CHART           APP VERSION     DESCRIPTION     
1               Thu Oct 14 20:44:16 2021        superseded      todos-0.1.0     1.0             Install complete
2               Fri Oct 15 10:45:59 2021        superseded      todos-0.1.0     1.1             Upgrade complete
3               Fri Oct 15 11:01:43 2021        deployed        todos-0.1.0     1.0             Rollback to 
```

We can check that the rollback drives to previous version by running:

```bash
kubectl describe pods -l app=frontend
```

We get:

```
# ....
Containers:
  frontend-ctr:
    Container ID:   docker://1047a4587b644a1d92e59d187c674696b0b5ef35f3762c9cfe034386b58c63f4
    Image:          jaimesalas/todo-app-frontend:0.1.0
# ....
```

To uninstall the release we can do:

```bash
```