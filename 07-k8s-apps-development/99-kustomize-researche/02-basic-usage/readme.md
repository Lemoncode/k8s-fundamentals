# Basic Usage

## Start Point 

To start with Kustomize, you need to have your original files describing any resources you want to deploy into your cluster. Those files will be stored on `./k8s/base/`

Those files will NEVER (EVER) be touched, we will just apply customization above them to create new resources definitions.

Create `./k8s/base/service.yml` 

```yml
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
    - name: http
      port: 80
  selector:
    app: lc-app

```

Create `./k8s/base/deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  selector:
    matchLabels:
      app: lc-app
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
        - name: app
          image: nginx:alpine
          resources: {}
          ports:
            - name: http
              containerPort: 80
              protocol: TCP

```

Create `./k8s/base/kustomization.yml`


```yml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - service.yml
  - deployment.yml

```

This file will be the central point of your base and it describes the resources that we're using. Those resources are the path relatively to the current file.

To apply your base template to your cluster, we can execute the following command:

```yml
kubectl apply -k k8s/base
```

To see what will be applied in your cluster we can run:

```bash
kustomize build k8s/base
```

Running with Docker:

```bash
docker run \
 -v `pwd`/k8s/base:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp
```

The result of above command  will be:

```yml
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  selector:
    matchLabels:
      app: lc-app
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - image: nginx:alpine
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources: {}
```

## Kustomization

Now we want to `kustomize` our app for a specific use case, `prod` environment. 

First of all, we will create the folder `k8s/overlays/prod`, inside this will place a specific version for `production`

Create `k8s/overlays/prod/kustomization.yml`

```yml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

```

If we build it, we will see the same result as before, using `base`

```bash
kustomize build k8s/overlays/prod
```

Or using Docker:

```bash
docker run \
 -v `pwd`:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp/k8s/overlays/prod
```

This will output the following `yaml`

```yml
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  selector:
    matchLabels:
      app: lc-app
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - image: nginx:alpine
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources: {}
```

Cool, we're now ready to apply `kustomization` to `prod` environment.

## Define Env variables for our deployment

In our `base`, we didn’t define any `env` variable. We will now add those `env` . We have to create the **chunk of yaml** we would like to apply above our `base` and reference it inside `kustomization.yaml`.

Create `./k8s/overlays/prod/custom-env.yaml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  template:
    spec:
      containers:
        - name: app # 1
          env:
            - name: CUSTOM_ENV_VARIABLE
              value: Value define by Kustomize

```

1. The `name` key here is very important and allow Kustomize to fid the right container which need to be modified.

This `yaml` is not valid, but it describes the addition we would like to do in our previous base.

Now we have to update `k8s/overlays/prod/kustomization.yml`

```diff
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

+patchesStrategicMerge:
+ - custom-env.yml
```

If we build this now:

```bash
kustomize build k8s/overlays/prod
```

Or using Docker:

```bash
docker run \
 -v `pwd`:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp/k8s/overlays/prod
```

We get the following output:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  selector:
    matchLabels:
      app: lc-app
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - env:
        - name: CUSTOM_ENV_VARIABLE
          value: Value define by Kustomize
        image: nginx:alpine
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
```

Our `env` block has been applied above our base and now the **CUSTOM_ENV_VARIABLE** will be defined inside our `deployment.yml`.

## Change the number of replicas

We will extend our base to define variables not already defined.

> NOTE: You can also override some variables already present in your base files

We would like to add information about the number of replica. 

Create `./k8s/overlays/prod/replica-and-rollout-strategy.yml`

```yml
apiVersion: apps/v1
kind: Deployment 
metadata:
  name: lc-app
spec:
  replicas: 10
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
    type: RollingUpdate
```

Now we have to update `k8s/overlays/prod/kustomization.yml`

```diff
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
  - ../../base

patchesStrategicMerge:
  - custom-env.yml
+ - replica-and-rollout-strategy.yml
```

If we build this now:

```bash
kustomize build k8s/overlays/prod
```

Or using Docker:

```bash
docker run \
 -v `pwd`:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp/k8s/overlays/prod
```

We get the following output:

```yml
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  replicas: 10
  selector:
    matchLabels:
      app: lc-app
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - env:
        - name: CUSTOM_ENV_VARIABLE
          value: Value define by Kustomize
        image: nginx:alpine
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources: {}
```

## Use a secret define through command line

`Kustomize` has a sub-command to edit a `kustomization.yaml` and create a secret for you. You just have to use it in your deployment like if it already exists.

```bash
cd k8s/overlays/prod
kustomize edit add secret lc-secret --from-literal=db-password=12345
```

> Note: You can also use secret comming from properties file (with `--from-file=file/path`) or from env file (with `--from-env-file=env/path.env`)

Or using Docker 

```bash
docker run -it \
 --entrypoint /bin/sh \
 -v `pwd`/k8s/overlays/prod:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7
```

From inside of container run:

```bash
cd /tmp
/app/kustomize edit add secret lc-secret --from-literal=db-password=12345
```

If we run:

```bash
kustomize build k8s/overlays/prod
```
Or using Docker:

```bash
docker run \
 -v `pwd`:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp/k8s/overlays/prod
```

We get the following output:

```yml
apiVersion: v1
data:
  db-password: MTIzNDU=
kind: Secret
metadata:
  name: lc-secret-gkmm8tkdd7
type: Opaque
---
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  replicas: 10
  selector:
    matchLabels:
      app: lc-app
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - env:
        - name: CUSTOM_ENV_VARIABLE
          value: Value define by Kustomize
        image: nginx:alpine
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources: {}
```

[Decode base64 online](https://codebeautify.org/base64-decode)

> NOTE: The secret name is `lc-secret-gkmm8tkdd7` instead `lc-secret`. This is made to trigger a rolling update of deployemnt if secrets content is changed.

If we want to use the secret, we have to add a new layer:

Create `k8s/overlays/prod/database-secret.yml`

```yaml
apiVersion: apps/v1
kind: Deployment 
metadata:
  name: lc-app
spec:
  template:
    spec:
      containers:
        - name: app
          env:
          - name: "DB_PASSWORD"
            valueFrom: 
              secretKeyRef:
                key: db-passwordd
                name: lc-secret
```
Now we have to update `k8s/overlays/prod/kustomization.yml`

```diff
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

patchesStrategicMerge:
  - custom-env.yml
  - replica-and-rollout-strategy.yml
+ - database-secret.yml

resources:
  - ../../base

secretGenerator:
  - literals:
      - db-password=12345
    name: lc-secret
    type: Opaque

```

If we run:

```bash
kustomize build k8s/overlays/prod
```
Or using Docker:

```bash
docker run \
 -v `pwd`:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp/k8s/overlays/prod
```

We get the following output:

```yml
apiVersion: v1
data:
  db-password: MTIzNDU=
kind: Secret
metadata:
  name: lc-secret-gkmm8tkdd7
type: Opaque
---
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  replicas: 10
  selector:
    matchLabels:
      app: lc-app
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              key: db-passwordd
              name: lc-secret-gkmm8tkdd7 # 1
        - name: CUSTOM_ENV_VARIABLE
          value: Value define by Kustomize
        image: nginx:alpine
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources: {}
```

1. You can see the `secretKeyRef.name` used is automatically modified to follow the name defined by Kustomize

## Change the image of a deployment

There is a custom directive to allow changing of image or tag directly from the command line, very useful in case we need the image previously tagged by `ci system`

```bash
cd k8s/overlays/prod
TAG_VERSION=3.4.5
kustomize edit set image nginx:alpine=nginx:alpine:$TAG_VERSION
```

Or using Docker 

```bash
docker run -it \
 --entrypoint /bin/sh \
 -v `pwd`/k8s/overlays/prod:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7
```

From inside of container run:

```bash
cd /tmp
TAG_VERSION=3.4.5
/app/kustomize edit set image nginx:alpine=nginx:alpine:$TAG_VERSION
```

`./k8s/overlays/prod/kustomization.yml` will be modified as follows:

```yml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

patchesStrategicMerge:
  - custom-env.yml
  - replica-and-rollout-strategy.yml
  - database-secret.yml

resources:
  - ../../base

secretGenerator:
  - literals:
      - db-password=12345
    name: lc-secret
    type: Opaque

images:
  - name: nginx:alpine
    newName: nginx:alpine
    newTag: 3.4.5

```

And if we build:

```bash
kustomize build k8s/overlays/prod
```
Or using Docker:

```bash
docker run \
 -v `pwd`:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp/k8s/overlays/prod
```

We get the following output:

```yml
apiVersion: v1
data:
  db-password: MTIzNDU=
kind: Secret
metadata:
  name: lc-secret-gkmm8tkdd7
type: Opaque
---
apiVersion: v1
kind: Service
metadata:
  name: lc-app
spec:
  ports:
  - name: http
    port: 80
  selector:
    app: lc-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lc-app
spec:
  replicas: 10
  selector:
    matchLabels:
      app: lc-app
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: lc-app
    spec:
      containers:
      - env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              key: db-passwordd
              name: lc-secret-gkmm8tkdd7
        - name: CUSTOM_ENV_VARIABLE
          value: Value define by Kustomize
        image: nginx:alpine:3.4.5
        name: app
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        resources: {}
```

## Conclusion

We see in these examples how we can leverage the power of Kustomize to define your Kubernetes files without even using a templating system. All the modification files you made will be applied above the original files without altering it with curly braces and imperative modification.

There is a lot of advanced topic in Kustomize, like the mixins and inheritance logic or other directive allowing to define a name, label or namespace to every created object… You can follow the [official Kustomize github repository](https://github.com/kubernetes-sigs/kustomize) to see advanced examples and documentation.