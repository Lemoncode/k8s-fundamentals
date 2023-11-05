# Port Forarding Demo

### Pre requisites

A running Kubernetes cluster and kubectl properly configured pointing to the cluster.

### Steps

Create this file _nginx.deployment.yml_

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  labels:
    app: my-nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-nginx
  template:
    metadata:
      labels:
        app: my-nginx
    spec:
      containers:
      - name: my-nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources: {}

```

```bash
kubectl apply -f nginx.deployment.yml
```

```bash
kubectl get all
```

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-nginx-77db6d9ff9-gnk5t   1/1     Running   0          32s
pod/my-nginx-77db6d9ff9-w9h59   1/1     Running   0          32s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   63d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-nginx   2/2     2            2           32s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-nginx-77db6d9ff9   2         2         2       32s
```

Now let's do port forwarding to one of this pods

```bash
kubectl port-forward pod/my-nginx-77db6d9ff9-gnk5t 8080:80
```

We can also use port forwarding with the deployment

```bash
kubectl get deployments
```

```
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   2/2     2            2           5m43s
```

```bash
kubectl port-forward deployment/my-nginx 8080:80
```

```
Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80
```
