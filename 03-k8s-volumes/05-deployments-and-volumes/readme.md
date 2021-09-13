# Deployments and Volumes

If we look back to the demos that we have done we will notice that everything has been made with a single `pod` asking for a single `volume claim`, but what about deployments, with mutiple replicase, will behave in the same way?

Let's try something and luckily with this example the learn concepts will sticky in our brain :)

## Creating a static provisioning

Let's start by creating a persistent volume, create `deployment-lc-pv.yml`

```yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: deployment-lc-pv
spec:
  capacity:
    storage: 10Mi
  accessModes:
    - ReadWriteOnce
  storageClassName: lc-fast
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/deployment-lc-vol
```

And now let's create `deployment-lc-pvc.yml`

```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: deployment-lc-pvc
spec:
  resources:
    requests:
      storage: 10Mi
  accessModes:
    - ReadWriteOnce
  storageClassName: lc-fast
```

Notice that the `accessModes` is `ReadWriteOnce`, this means that the volume will be accesible from a single node. Ok, let's create a new deployment with 3 replicas, and this replicas will use this claim.

Create `deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: nginx:alpine
        volumeMounts:
          - mountPath: /usr/share/nginx/html
            name: static 
        resources:
          limits: {}
        ports:
        - containerPort: 80
      volumes:
        - name: static
          persistentVolumeClaim:
            claimName: deployment-lc-pvc

```

Ok, let's deploy this:

```bash
kubectl apply -f ./deployment-lc-pv.yml
kubectl apply -f ./deployment-lc-pvc.yml
kubectl apply -f ./deployment.yml
```

Let's have a look inti the pods that we have created:

```bash
kubectl get pods
```

We get something similar to this:

```
myapp-59764559b6-8r6z2   1/1     Running   0          53s
myapp-59764559b6-rmh2m   1/1     Running   0          53s
myapp-59764559b6-tdcbw   1/1     Running   0          53s
```

Recall that we're mounting `/usr/share/nginx/html` let's create a file on one of the pods:

```bash
kubectl exec -it myapp-59764559b6-8r6z2 -- /bin/sh
```

Ok now run:

```bash
cat <<EOF | tee /usr/share/nginx/html/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h3>Hello</h3>
</body>
</html>
EOF
```

Ok, now our work is done, let's get out from here, and have a look in other pod deployment and find out if the file is on the mount path.

```bash
kubectl exec -it myapp-59764559b6-rmh2m -- /bin/sh
```

Inside of caontainer run:

```bash
cat /usr/share/nginx/html/index.html
```

We will see the following output:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h3>Hello</h3>
</body>
</html>
```

Ok, we have the same file, this is great. But what will happen, if we create a new deployment using the same pvc, what do you expect? Before move forward, remember we have a `pv` and a `pvc`.

```bash
kubectl get pv
NAME               CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS   REASON   AGE
deployment-lc-pv   10Mi       RWO            Retain           Bound    default/deployment-lc-pvc   lc-fast                 10m
```

```bash
kubectl get pvc
NAME                STATUS   VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   AGE
deployment-lc-pvc   Bound    deployment-lc-pv   10Mi       RWO            lc-fast        11m
```

Ok, let's create `other-deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otherapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: otherapp
  template:
    metadata:
      labels:
        app: otherapp
    spec:
      containers:
      - name: otherapp
        image: nginx:alpine
        volumeMounts:
          - mountPath: /usr/share/nginx/html
            name: static 
        resources:
          limits: {}
        ports:
        - containerPort: 80
      volumes:
        - name: static
          persistentVolumeClaim:
            claimName: deployment-lc-pvc
```

Notice that we're using the same `claim`, let's deploy this:

```bash
kubectl apply -f ./other-deployment.yml 
```

And let's grab one of the pods that we have created:

```bash
kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
myapp-59764559b6-8r6z2      1/1     Running   0          17m
myapp-59764559b6-rmh2m      1/1     Running   0          17m
myapp-59764559b6-tdcbw      1/1     Running   0          17m
otherapp-7f74b58c8b-hdcck   1/1     Running   0          45s
otherapp-7f74b58c8b-k8fkq   1/1     Running   0          45s
otherapp-7f74b58c8b-mcx2v   1/1     Running   0          45s
```

```bash
kubectl exec -it otherapp-7f74b58c8b-hdcck -- /bin/sh
```

Inside of caontainer run:

```bash
cat /usr/share/nginx/html/index.html
```

We will see the following output:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h3>Hello</h3>
</body>
</html>
```

So, we can even more than one deployment, and use the same `claim`, interesting, really interesting. Now, let's update `other-deployment.yml`

```diff
+ apiVersion: v1
+ kind: PersistentVolumeClaim
+ metadata:
+   name: other-lc-pvc 
+ spec:
+   accessModes:
+     - ReadWriteOnce
+   storageClassName: lc-fast
+   resources:
+     requests:
+       storage: 10Mi
+ ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otherapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: otherapp
  template:
    metadata:
      labels:
        app: otherapp
    spec:
      containers:
      - name: otherapp
        image: nginx:alpine
        volumeMounts:
          - mountPath: /usr/share/nginx/html
            name: static 
        resources:
          limits: {}
        ports:
        - containerPort: 80
      volumes:
        - name: static
          persistentVolumeClaim:
+           claimName: other-lc-pvc
-           claimName: deployment-lc-pvc

```

Notice that we're creating a new claim, over the same type of volume:

```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: other-lc-pvc 
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: lc-fast
  resources:
    requests:
      storage: 10Mi

```

```bash
kubectl apply -f ./other-deployment.yml 
```

If we run:

```bash
kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
myapp-59764559b6-8r6z2      1/1     Running   0          29m
myapp-59764559b6-rmh2m      1/1     Running   0          29m
myapp-59764559b6-tdcbw      1/1     Running   0          29m
otherapp-57d996959-m7kxt    0/1     Pending   0          56s
otherapp-7f74b58c8b-hdcck   1/1     Running   0          11m
otherapp-7f74b58c8b-k8fkq   1/1     Running   0          11m
otherapp-7f74b58c8b-mcx2v   1/1     Running   0          11m
```

We notice that we have an extra pod and its status is pending, and if we run:

```bash
kubectl get pvc
NAME                STATUS    VOLUME             CAPACITY   ACCESS MODES   STORAGECLASS   AGE
deployment-lc-pvc   Bound     deployment-lc-pv   10Mi       RWO            lc-fast        31m
other-lc-pvc        Pending                                                lc-fast        2m46s
```

Remind once a `volume` is claimed by a `claim`, it can not be claimed by other one.

## Clean up

```bash
kubectl delete -f ./
```
