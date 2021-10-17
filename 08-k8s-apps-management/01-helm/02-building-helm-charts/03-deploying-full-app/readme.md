# Deploying Full App

### Steps

### 1. Starting point

Copy the contents of `02-building-helm-charts/01-deploying-frontend` into a new diretory

We get the following diretory structure:

```
app/
├─ frontend/
yaml/
```

Copy `00-start-code/todo-app-api` into `app`

```
app/
├─ frontend/
├─ todo-app-api/
yaml/
```

To simplify naming and paths, rename `app/todo-app-api` to `app/backend`

```
app/
├─ frontend/
├─ backend/
yaml/
```

### 2. Creating manifests

Let's start by creating the database.

Create `yaml/mongodb.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo
          env:
            - name: MONGO_INITDB_DATABASE
              value: tododb
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongodb-username
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongodb-password
          ports:
            - name: mongodb
              containerPort: 27017
          volumeMounts:
            - name: mongodb-volume
              mountPath: /data/db
          resources: {}
      volumes:
        - name: mongodb-volume
          persistentVolumeClaim:
            claimName: mongodb-pvc

```

Create `yaml/mongodb-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    name: mongodb
  name: mongodb
spec:
  selector:
    app: mongodb
  ports:
    - name: monongodb
      port: 27017
      targetPort: 27017
  type: NodePort

```

Create `yaml/mongodb-secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
data:
  mongodb-username: YWRtaW4=
  mongodb-password: cGFzc3dvcmQ=
```

Notice that the feeded values are on `base64`

```bash
echo 'YWRtaW4=' | base64 --decode
admin
```

```bash
echo 'cGFzc3dvcmQ=' | base64 --decode
password
```

Create `yaml/mongodb-persistent-volume.yaml`

```yaml
kind: PersistentVolume
apiVersion: v1
metadata:
  name: mongodb-pv-volume
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 100Mi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/data
```

Create `yaml/mongodb-persistent-volume-claim.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
```

Before we can create backend infrastructure, we have to deploy a new backend image.

Change directory to `app/backend`, and run:

```bash
./dockerize.sh "jaimesalas/todo-app-api:0.1.0" 
```

And push to the remote repository

```bash
docker push jaimesalas/todo-app-api:0.1.0
```

Create `backend.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: jaimesalas/todo-app-api:0.1.0
          imagePullPolicy: Always
          ports:
            - name: backend
              containerPort: 3000
          env:
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: backend-secret
                  key: mongodb-uri
          resources: {}

```

Create `backend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    name: backend
  name: backend
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000

```

Create `backend-secret.yaml`

To encode the `uri` with `base64`

```bash
echo "mongodb://admin:password@mongodb:27017/tododb?authSource=admin" | base64
```

We get 

```
bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvdG9kb2RiP2F1dGhTb3VyY2U9YWRtaW4K
```
Now with this value we can create the secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
data:
  mongodb-uri: bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvdG9kb2RiP2F1dGhTb3VyY2U9YWRtaW4K

```

### 3. Updating manifests

Now we have to update frontend and ingress, to make all parts of our application reachable.

Update `yaml/ingress`

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
    # diff
    - host: backend.minikube.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 80

```

Create `yaml/frontend-configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  todo-title: "Default"
  backend-uri: "backend.minikube.local"
  cors: "true"
```

Update `frontend.yaml`


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
          image: jaimesalas/todo-app-frontend:0.1.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: frontend
              containerPort: 8080
+         env:
+           - name: TODO_APP_API
+             valueFrom:
+               configMapKeyRef:
+                 name: frontend-config
+                 key: backend-uri
+           - name: TODO_APP_TITLE
+             valueFrom:
+               configMapKeyRef:
+                 name: frontend-config
+                 key: todo-title
+           - name: CORS_ACTIVE
+             valueFrom:
+               configMapKeyRef:
+                 name: frontend-config
+                 key: cors
+         resources: {}

```

### 4. Start up

Change directory to `./yaml` and run

```bash
kubectl apply -f backend-secret.yaml
kubectl apply -f backend-service.yaml 
kubectl apply -f backend.yaml 
kubectl apply -f frontend-configmap.yaml 
kubectl apply -f frontend-service.yaml 
kubectl apply -f frontend.yaml 
kubectl apply -f ingress.yaml 
kubectl apply -f mongodb-persistent-volume.yaml
kubectl apply -f mongodb-persistent-volume-claim.yaml
kubectl apply -f mongodb-secret.yaml
kubectl apply -f mongodb-service.yaml
kubectl apply -f mongodb.yaml
```

Check the state of the cluster by running:

```bash
kubectl get all
```

We get something like:

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-b75b6f9bc-bp5sv     1/1     Running   2          2m5s
pod/frontend-5b7cf59787-cffnw   1/1     Running   0          2m3s
pod/mongodb-75d8848dd8-cwbwb    1/1     Running   0          2m1s

NAME                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)           AGE
service/backend      ClusterIP   10.99.81.1       <none>        80/TCP            2m5s
service/frontend     ClusterIP   10.109.244.219   <none>        80/TCP            2m4s
service/kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP           54d
service/mongodb      NodePort    10.98.248.205    <none>        27017:32126/TCP   2m1s

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    1/1     1            1           2m5s
deployment.apps/frontend   1/1     1            1           2m3s
deployment.apps/mongodb    1/1     1            1           2m1s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/backend-b75b6f9bc     1         1         1       2m5s
replicaset.apps/frontend-5b7cf59787   1         1         1       2m3s
replicaset.apps/mongodb-75d8848dd8    1         1         1       2m1s
```

For last if we want to acceess the application from our browser, we need to update `/etc/hosts`

```bash
kubectl get ingress
```

We get something similar to this:

```
NAME           CLASS    HOSTS                                            ADDRESS        PORTS   AGE
todo-ingress   <none>   frontend.minikube.local,backend.minikube.local   192.168.49.2   80      4m29s
```

Now we can update `/etc/hosts`


### 5. Clean up

```bash
kubectl delete -f backend-secret.yaml
kubectl delete -f backend-service.yaml
kubectl delete -f backend.yaml
kubectl delete -f frontend-configmap.yaml
kubectl delete -f frontend-service.yaml
kubectl delete -f frontend.yaml
kubectl delete -f ingress.yaml
kubectl delete -f mongodb-secret.yaml
kubectl delete -f mongodb-service.yaml
kubectl delete -f mongodb.yaml
kubectl delete -f mongodb-persistent-volume-claim.yaml
kubectl delete -f mongodb-persistent-volume.yaml
```