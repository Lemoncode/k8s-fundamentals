# ConfigMaps Demo

## Steps

### Step 1. Let's create the demo code.

We're going to create a web app, this app will be dump into a deployment, and will read environent variables from different sources.

Create `app/server.js`

```js
const http = require('http');

const handler = (_, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(`'ENEMIES' (from env variable): ${process.env.ENEMIES} <br />`);
    response.end();
};

const www = http.createServer(handler);
www.listen(9000);

```

1. We're reading the environment variable `ENEMIES` from global Nodejs object.
2. We're reading the data from `/etc/config/enemies.cheat.level`


Create `app/Dockerfile`

```Dockerfile
FROM node:alpine 

COPY server.js server.js 

ENTRYPOINT ["node", "server.js"]

```

### Step 2. Creating ConfigMaps

Remember that we have different techniques to work with `ConfigMaps`, we can create them from a manifest, using a yaml file:

Create `K8s/settings.configmap.yml`

```yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-settings
  labels:
    app: app-settings
data:
  enemies: aliens
  lives: "3"
  enemies.cheat: "true"
  enemies.cheat.level: noGoodRotten


```

We can go a head and create this by running:

```bash
$ kubectl create -f settings.configmap.yml
```

Now we can have a look

```bash
$ kubectl get cm
NAME               DATA   AGE
app-settings       4      67s
```

## Step 3. Prepare Container for Deployment

> TODO: Extract this to a different demo

To make this image available in a `Kubernetes Deployment`, we need to rely over a registry. During the following demos we will be using `Docker Hub`, but it's good to now that we have other options like using `minikube` internals.

Start by `cd` into Dockerfile directory.

> Reference: https://minikube.sigs.k8s.io/docs/handbook/pushing/

To point your terminal to use the docker daemon inside minikube run this:

`eval $(minikube docker-env)`

Now any ‘docker’ command you run in this current terminal will run against the docker inside minikube cluster, so if you do the following commands, it will show you the containers inside the minikube, inside minikube’s VM or Container.

`docker ps`

Now you can ‘build’ against the docker inside `minikube`, which is instantly accessible to kubernetes cluster.


Build Docker image

```bash
$ docker build -t node-configmap .

# To rely on DockeHub
$ docker build -t jaimesalas/node-configmap .
$ docker push jaimesalas/node-configmap
```

We can check that the image has been created by running:

```bash
$ docker image ls
REPOSITORY                                TAG        IMAGE ID       CREATED          SIZE
node-configmap                            latest     4eb04892586b   10 seconds ago   113MB
# ....
```

To verify your terminal is using minikuber’s docker-env you can check the value of the environment variable MINIKUBE_ACTIVE_DOCKERD to reflect the cluster name.

> Tip 1: Remember to turn off the imagePullPolicy:Always (use imagePullPolicy:IfNotPresent or imagePullPolicy:Never) in your yaml file. Otherwise Kubernetes won’t use your locally build image and it will pull from the network.

> Tip 2: Evaluating the docker-env is only valid for the current terminal. By closing the terminal, you will go back to using your own system’s docker daemon.

### Step 4. Create a Deployment

Now we're ready to create a new `Deployment`, that will consume the previous created `ConfigMap`. Create `K8s/node.deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-configmap
spec:
  selector:
    matchLabels:
      app: node-configmap
  template:
    metadata:
      labels:
        app: node-configmap
    spec:
      containers:
      - name: node-configmap
        image: node-configmap
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 9000

```

If we're relying into `DockerHub` registry

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-configmap
spec:
  selector:
    matchLabels:
      app: node-configmap
  template:
    metadata:
      labels:
        app: node-configmap
    spec:
      containers:
      - name: node-configmap
        image: jaimesalas/node-configmap
        imagePullPolicy: Always
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 9000
```

Now let's move to `K8s` directory and create our `Deployment`

```bash
$ kubectl apply -f ./node.deployment.yml
```

Or 

```bash
$ kubectl create -f ./node.deployment.yml --save-config
```

Check that Deployment has been successfuly deployed:

```bash
$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/node-configmap-5b474b7595-672qp   1/1     Running   0          6s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   6d15h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/node-configmap   1/1     1            1           6s

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/node-configmap-5b474b7595   1         1         1       6s
```

Now to see our deployment on our local browser, we can run:

```bash
$ kubectl port-forward <pod-name> 9000
```

```bash
$ kubectl port-forward node-configmap-5b474b7595-672qp 9000
Forwarding from 127.0.0.1:9000 -> 9000
Forwarding from [::1]:9000 -> 9000
```


### Step 5. Reading environment variables in Deployment

Now to read `app-settings ConfigMap` we can follow different techniques:

1. Map env variables data to a ConfigMap property, let's update `node.deployment.yml`

```diff
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-configmap
spec:
  selector:
    matchLabels:
      app: node-configmap
  template:
    metadata:
      labels:
        app: node-configmap
    spec:
      containers:
      - name: node-configmap
        image: node-configmap
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 9000
+       env:
+         - name: ENEMIES
+           valueFrom:
+             configMapKeyRef:
+               name: app-settings
+               key: enemies


```

Run `kubectl apply -f ./node.deployment.yml ` and let's have a look to get the pod that we want to forward.

```bash
$  kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/node-configmap-85b8d85f8c-cn45b   1/1     Running   0          43s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   6d16h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/node-configmap   1/1     1            1           32m
```

```bash
$ kubectl port-forward node-configmap-85b8d85f8c-cn45b 9000
Forwarding from 127.0.0.1:9000 -> 9000
Forwarding from [::1]:9000 -> 9000
```

`google localhost:9000`

2. Load all ConfigMap keys/values into environment variables (simplified way if you need them all vs. only a few as with "env" above)

First lets update our code `server.js`

```js
const http = require('http');

const handler = (_, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    // response.write(`'ENEMIES' (from env variable): ${process.env.ENEMIES} <br />`);
    /*diff*/
    response.write(`
        'ENEMIES' (from ConfigMap): ${process.env.enemies} <br />
        'LIVES' (from ConfigMap): ${process.env.lives} <br />
    `);
    /*diff*/
    response.end();
};

const www = http.createServer(handler);
www.listen(9000);

```

```bash
$ docker build -t jaimesalas/node-configmap .
$ docker push jaimesalas/node-configmap
```

Update `K8s/node.deployment.yml`

```diff
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-configmap
spec:
  selector:
    matchLabels:
      app: node-configmap
  template:
    metadata:
      labels:
        app: node-configmap
    spec:
      containers:
      - name: node-configmap
        image: jaimesalas/node-configmap
        imagePullPolicy: Always
        resources: {}
        ports:
        - containerPort: 9000
-       env:
-         - name: ENEMIES
-           valueFrom:
-             configMapKeyRef:
-               name: app-settings
-               key: enemies
+       envFrom:
+         - configMapRef:
+             name: app-settings


```

Update Deployment as follows:

```bash
$ kubectl apply -f ./node.deployment.yml
```

Now we can inspect this on a browser

```bash
$ kubectl get all
NAME                                  READY   STATUS    RESTARTS   AGE
pod/busybox                           1/1     Running   1          68m
pod/node-configmap-6f77855478-dvpj2   1/1     Running   0          81s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   6d18h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/node-configmap   1/1     1            1           13m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/node-configmap-6c99cd7cb    0         0         0       13m
replicaset.apps/node-configmap-6f77855478   1         1         1       81s
```

```bash
$ kubectl port-forward node-configmap-6f77855478-dvpj2 9000
Forwarding from 127.0.0.1:9000 -> 9000
Forwarding from [::1]:9000 -> 9000
```

3. Reference ConfigMap data at appropiate path (/etc/config)

First lets update our code `server.js`

```js
const http = require('http'), 
      fs = require('fs');

const handler = (_, response) => {
    fs.readFile('/etc/config/enemies.cheat.level', 'UTF-8', (err, fileData) => {
        
        if (err) {
            console.log(err);
            return;
        }

        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(`
            'ENEMIES' (from ConfigMap): ${process.env.enemies} <br />
            'LIVES' (from ConfigMap): ${process.env.lives} <br />
        `);
        response.write(`'enimies.cheat.level' (from volume): ${fileData}`);
        
        response.end();
    });
};

const www = http.createServer(handler);
www.listen(9000);

```

Build and push a new image 

```bash
$ docker build -t jaimesalas/node-configmap .
$ docker push jaimesalas/node-configmap
```

Update `K8s/node.deployment.yml`


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-configmap
spec:
  selector:
    matchLabels:
      app: node-configmap
  template:
    metadata:
      labels:
        app: node-configmap
    spec:

      volumes:
        - name: app-config-vol
          configMap:
            name: app-settings

      containers:
      - name: node-configmap
        image: jaimesalas/node-configmap
        imagePullPolicy: Always
        resources: {}
        ports:
        - containerPort: 9000
        
        volumeMounts:
          - mountPath: /etc/config
            name: app-config-vol

        envFrom:
          - configMapRef:
              name: app-settings


```


```bash
$ kubectl apply -f ./node.deployment.yml
```

```bash
$ kubectl get all
NAME                                  READY   STATUS        RESTARTS   AGE
pod/busybox                           1/1     Running       1          100m
pod/node-configmap-5bf6576cb9-wkqcn   1/1     Running       0          23s
pod/node-configmap-6f77855478-mbjgm   1/1     Terminating   0          12m

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   6d19h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/node-configmap   1/1     1            1           12m

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/node-configmap-5bf6576cb9   1         1         1       23s
replicaset.apps/node-configmap-6f77855478   0         0         0       12m
```


```bash
$ kubectl port-forward node-configmap-5bf6576cb9-wkqcn 9000
Forwarding from 127.0.0.1:9000 -> 9000
Forwarding from [::1]:9000 -> 9000
```

### Cleanup resources

`cd` into `K8s` and run 

```bash
$ kubectl delete -f ./
```
