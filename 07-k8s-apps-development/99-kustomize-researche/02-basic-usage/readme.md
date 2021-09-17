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
