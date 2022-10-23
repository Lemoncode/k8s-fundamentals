### Using Secrets

Kubernetes is running (with a single Node), we'll only use the local-storage option, however in cloud scenarios the SC/PVC could be modififed as appropriate for the cloud provider's storage options.

## Running the MongoDB Deployment

### 1. Let's create the secret

As administrator of a cluster, what we're going to do is create the secrets that will be consumed by a `Mongo deployment`

```bash
kubectl create secret generic db-passwords --from-literal=db-password='password' --from-literal=db-root-password='password'
```

If we run

```bash
kubectl get secrets
```

We get 

```
NAME                  TYPE                                  DATA   AGE
db-passwords          Opaque                                2      9s
default-token-2lm6p   kubernetes.io/service-account-token   3      74d
```

Now it's important to know, that K8s doesn't store secrets encrypted, so we can read the content of a secret by running:

```bash
kubectl get secret <SECRET_NAME> -o jsonpath="{.data.<DATA>}" | base64 --decode
```

To find out all the values we can run:

```bash
kubectl describe secrets db-passwords
```

We get:

```
Name:         db-passwords
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
db-root-password:  8 bytes
db-password:       8 bytes
```

In our case:

```bash
kubectl get secret db-passwords -o jsonpath="{.data.db-password}" | base64 --decode
```

### 2. Create the Mongo Deployment

Create `mongo.deployment.yml`

First let's start by creating a `ConfigMap`

```yml
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    app: mongo-secrets-env
  name: mongo-secrets-env
data:
  MONGODB_DBNAME: ticketdb
  MONGO_INITDB_ROOT_USERNAME: admin
```

Here we're defining the database name and the root user. These environment variables are defined by the [Mongodb Docker Image](https://hub.docker.com/_/mongo?tab=description&page=1&ordering=last_updated&name=4.4.7)

Now we create a `StorageClass`

```yml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata: 
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

We need a storage class in order to [delay volume binding until Pod scheduling](https://kubernetes.io/docs/concepts/storage/storage-classes/#local)

Now we are going to define the PV and PVC for our database data:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongo-pv
spec:
  capacity:
    storage: 1Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  storageClassName: local-storage
  hostPath:
    path: /data/db

---

apiVersion: v1
kind: PersistentVolumeClaim
metadata: 
  name: mongo-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: local-storage
  resources:
    requests:
      storage: 1Gi
```

For last we're going to declare our database, we're going to do this using a `StatefulSet`

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: mongo
  name: mongo
spec:
  selector:
    matchLabels:
      app: mongo
  serviceName: mongo
  replicas: 1
  template:
    metadata:
      labels:
        app: mongo
    spec:
      volumes:
        - name: mongo-volume
          persistentVolumeClaim:
            claimName: mongo-pvc
        - name: secrets
          secret:
            secretName: db-passwords
      containers:
      - name: mongo
        image: mongo:4.4.7
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongo-volume
          mountPath: /data/db
        - name: secrets
          mountPath: /etc/db-passwords
          readOnly: true
        env: # 1.
        - name: MONGODB_DBNAME
          valueFrom:
            configMapKeyRef:
              key: MONGODB_DBNAME
              name: mongo-secrets-env
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            configMapKeyRef:
              name: mongo-secrets-env
              key: MONGO_INITDB_ROOT_USERNAME
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-passwords
              key: db-password

```

1. On `env` section, we're pluging the required Mongodb environment variables, notice that the we're loading the  `MONGO_INITDB_ROOT_PASSWORD` from our previous defined secrets.

### 3. Start up

No we're reeady to get our deployment to live

```bash
kubectl create -f mongo.deployment.yml
```

We have the following output:

```
configmap/mongo-secrets-env created
storageclass.storage.k8s.io/local-storage created
persistentvolume/mongo-pv created
persistentvolumeclaim/mongo-pvc created
statefulset.apps/mongo created
```

Now we can see the new Pod created

```bash
kubectl get pods
```

We get:

```
NAME      READY   STATUS    RESTARTS   AGE
mongo-0   1/1     Running   0          2m50s
```

Let's inspect this pod by running:

```bash
kubectl exec mongo-0 -it -- /bin/sh 
```

Now we can connect with our root user:

```bash
mongo --username admin --password password
```

Also if we exit the mongo connection, we can find our secrets

```bash
cd /etc/db-passwords
ls
db-password  db-root-password
# we can inspect its content using cat
exit
```

Let's delete the pod and see what happens with the volumes:

```bash
kubectl delete pod mongo-0
```

And run:

```bash
kubectl get pv
```

The volume doesn't go away, its default lifecycle is `Retain`, and its status is `bound`. Also the scheduler as soon we remove the Pod a new one comes to live with the same name, that's thanks to `Stateful` object. 

Let's clean up:

```bash
kubectl delete -f mongo.deployment.yml
```

We get:

```
configmap "mongo-secrets-env" deleted
storageclass.storage.k8s.io "local-storage" deleted
persistentvolume "mongo-pv" deleted
persistentvolumeclaim "mongo-pvc" deleted
statefulset.apps "mongo" deleted
```

### References

https://kubernetes.io/docs/concepts/configuration/secret/
https://kubernetes.io/blog/2017/01/running-mongodb-on-kubernetes-with-statefulsets/
https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/
https://itnext.io/exposing-statefulsets-in-kubernetes-698730fb92a1
https://howchoo.com/kubernetes/read-kubernetes-secrets
