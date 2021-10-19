# Immutable K8s

## Steps

### 1. Create a config image

Now we can't share volumes directly like we did on Docker example. So we need a base image that allows us to copy the configuration files inside.

```Dockerfile
FROM alpine

COPY app-dev.config.json /config-src/app-dev.config.json

ENTRYPOINT [ "sh", "-c", "cp /config-src/* $1", "--" ]
```

Let's build and push the image, in order we can use it on a K8s deployment

```bash
cd config-image
```

```bash
docker build -t jaimesalas/config-dev:0.0.1 .
```

```bash
docker push jaimesalas/config-dev:0.0.1
```

### 2. Create the deployment

No we're ready to create a deployment that uses the previous image.

Create `immutable-config-app.deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: config-app-deployment
  labels:
    app: config-app
spec:
  selector:
    matchLabels:
      app: config-app
  template:
    metadata:
      labels:
        app: config-app
    spec:
      volumes:
        - name: config-directory
          emptyDir: {}
      initContainers:
        - name: init
          image: jaimesalas/config-dev:0.0.1
          imagePullPolicy: Always
          args:
            - "/config"
          volumeMounts:
            - mountPath: "/config"
              name: config-directory
      containers:
        - name: config-app-ctr
          image: jaimesalas/immutable-config-app:0.0.1
          imagePullPolicy: Always
          resources: {}
          volumeMounts:
            - mountPath: "/config"
              name: config-directory

```

* `config-directory` is of type `emptyDir`
* We set a single argument `/config` used by the image’s `ENTRYPOINT`. This argument instructs the init container to copy its content to the specified directory. The directory `/config` is mounted from the volume `config-directory`.
* The application container mounts the volume `config-directory` to access the configuration that was copied over by the init container.

```bash
kubectl apply -f immutable-config-app.deployment.yml
```

```bash
kubectl get pods
```

Grab the pod name, and run:

```bash
kubectl exec -it <pod name> -- sh
```

And inside the container we can inspect and find the directory:

```sh
~/app $ ls
config-reader.service.js  node_modules              package-lock.json         package.json              server.js                 start-server.js
~/app $ cd /config/
/config $ ls
app-dev.config.json
/config $ 
```

### Clean Up

```bash
kubectl delete -f immutable-config-app.deployment.yml 
```