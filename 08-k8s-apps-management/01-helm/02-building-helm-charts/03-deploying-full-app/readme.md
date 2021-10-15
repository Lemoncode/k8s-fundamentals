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

