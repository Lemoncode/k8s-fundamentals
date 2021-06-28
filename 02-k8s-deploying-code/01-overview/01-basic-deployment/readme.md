# Basic Deployment

Create `nginx.deployment.yml`

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
        resources:
          limits:
            memory: "128Mi" #128 MB
            cpu: "200m" #200 millicpu (.2 or 20% of the cpu)
        ports:
        - containerPort: 80

```

```bash
$ kubectl create -f nginx.deployment.yml --save-config
```

We're saving the first snapshot by using **--save-config**

```bash
$ kubectl get pods 
$ kubectl get all 
```

We don't have a service, but if we want to test that the deployent is working we can use `kubectl port-fordward [name-of-pod] 8080:80`. 

Now if we want to scale up we can use `apply`, modify _nginx.deployment.yml_

```diff
...
spec:
- replicas: 2
+ replicas: 4
...
```

```bash
kubectl apply -f nginx.deployment.yml
```

Now if we run `kubectl get pods` we can check that we have 4.

### Cleanup

```bash
$ kubectl delete -f ./
```
