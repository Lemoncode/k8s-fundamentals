# Using Multiple Encvironments

## Before start

We're going to use `02-kustomize/00-simple-app`, as base application to deploy and customize.

The directory structure that we will have at the end of this demo will look as follows:

```
.
├── base
│   ├── terminal.deployment.yaml
│   ├── terminal.service.yaml
│   └── kustomization.yaml
├── overlays
│   ├── production
│   │   ├── kustomization.yaml
│   │   └── namespace.yaml
│   └── staging
│       ├── terminal-patch.yaml
│       ├── kustomization.yaml
│       └── namespace.yaml
```

## Steps

### 1.  Create base directory

Create `.k8s/base/terminal.deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: terminal-app
  labels:
    tier: internal-app
spec:
  selector:
    matchLabels: {}
  template:
    metadata:
      labels: {}
    spec:
      containers:
        - name: app
          image: jaimesalas/terminal-service:0.0.1
          imagePullPolicy: Always
          env:
            - name: PORT
              value: "4000"
          resources: {}


```

Create `.k8s/base/terminal.service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: terminal-service
spec:
  selector: {}
  ports:
    - port: 80
      targetPort: 4000
      protocol: TCP

```

> Notice that on Deployment and Service we haven't added any label related with bound the K8s objects between them.

Here we only have two files, but it could be many more. Now we create a new `kustomization.yaml`.

From `.k8s/base`, run:

```bash
kustomize create
```

It creates a new `kustomization.yaml` file, with the following content.

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

```

Now if we update `.k8s/base/kustomization.yaml`, with resources, the targets for customization and set the property `commonLabels`, we can `build`, and see that the labels are applied on the right places 

Create `.k8s/base/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
# diff
commonLabels:
  app: terminal-app
resources:
  - terminal.service.yaml
  - terminal.deployment.yaml
# diff
```

Let's build it:

```bash
kustomize build
```

We get the following output:

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: terminal-app
  name: terminal-service
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 4000
  selector:
    app: terminal-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: terminal-app
    tier: internal-app
  name: terminal-app
spec:
  selector:
    matchLabels:
      app: terminal-app
  template:
    metadata:
      labels:
        app: terminal-app
    spec:
      containers:
      - env:
        - name: PORT
          value: "4000"
        image: jaimesalas/terminal-service:0.0.1
        imagePullPolicy: Always
        name: app
        resources: {}
```

We find out that the label `app: terminal-app`, has been added. We can actually deploy it by running `kubectl -k apply`. But the `base` it's not supposed to be deployed on its own.

### 2. Creating Overlays - Staging

Let's create a new overlay bound to `staging` environment:

Create `.k8s/overlays/staging/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: staging
```

Here we're simply creating a new K8s `Namespace`, that will host the `staging` version. 

Now let's create `.k8s/overlays/staging/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: staging
commonLabels:
  environment: staging
bases:
  - ../../base
resources:
  - namespace.yaml
```

If we run `kustomize build` from `.k8s/overlays/staging` directory, we get:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    environment: staging
  name: staging
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: terminal-app
    environment: staging
  name: terminal-service
  namespace: staging
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 4000
  selector:
    app: terminal-app
    environment: staging
---
# ....
```

The K8s objects has been added to `staging namespace`, also we have added a new label `environment: staging`.

Now, we can go a step further and use `patching`.

> Patches add or replace parts of manifests. They never remove existing resources or parts of resources.

Let's create a patch tha modifies the port and image where the application is listening on `staging` environment.

Create `.k8s/overlays/staging/terminal.patch.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: terminal-service
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: terminal-app
spec:
  selector:
  template:
    spec:
      containers:
        - env:
            - name: PORT
              value: "3000"
          image: jaimesalas/terminal-service:0.0.2
          name: app
          resources: {}

```

Now we have to update `.k8s/overlays/staging/kustomization.yaml`, to take into account this `patch`:

```diff
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: staging
commonLabels:
  environment: staging
bases:
  - ../../base
+patchesStrategicMerge:
+ - terminal.patch.yaml
resources:
  - namespace.yaml
```

Now if we run `kustome build` we get:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    environment: staging
  name: staging
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: terminal-app
    environment: staging
  name: terminal-service
  namespace: staging
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 3000
  selector:
    app: terminal-app
    environment: staging
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: terminal-app
    environment: staging
    tier: internal-app
  name: terminal-app
  namespace: staging
spec:
  selector:
    matchLabels:
      environment: staging
  template:
    metadata:
      labels:
        app: terminal-app
        environment: staging
    spec:
      containers:
      - env:
        - name: PORT
          value: "3000"
        image: jaimesalas/terminal-service:0.0.2
        imagePullPolicy: Always
        name: app
        resources: {}
```

This is a strategic merge. Kustomize supports another type of patch called `JsonPatches6902`. It is based on `RFC 6902`. It is often more concise than a strategic merge. 

Since JSON is a subset of YAML, we can use YAML syntax for JSON 6902 patches.

Let's create `.k8s/overlays/staging/terminal.deployment.6902-patch.yaml`

```yaml
- op: replace
  path: /spec/template/spec/containers/0/image
  value: jaimesalas/terminal-service:0.0.2
- op: replace
  path: /spec/template/spec/containers/0/env
  value:
    - name: PORT
      value: "3000"
```

And also `.k8s/overlays/staging/terminal.service.6902-patch.yaml` 

```yaml
- op: replace
  path: /spec/ports/0
  value:
    - port: 80
      targetPort: 3000
      protocol: TCP

```

Now we have to update `.k8s/overlays/staging/kustomization.yaml`

```diff
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: staging
commonLabels:
  environment: staging
bases:
  - ../../base
-patchesStrategicMerge:
-  - terminal.patch.yaml
+patchesJson6902:
+  - target:
+      kind: Deployment
+      name: terminal-app
+      version: v1
+    path: terminal.deployment.6902-patch.yaml
+  - target:
+      kind: Service
+      name: terminal-service
+      version: v1
+    path: terminal.service.6902-patch.yaml
resources:
  - namespace.yaml

```

Now if we run `kustomize build`, we get the same result as before.

### 3. Creating Overlays - Production

> EXERCISE: Create a production overlay, where we set limits for containers on deployment object and add as well 2 replicas. Also add a new namespace `production`


For last we are going to add a new `prodcution overlay`.

Create `.k8s/overlays/production/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: prodcution
```

Let's add the patch for production:

Create `.k8s/overlays/production/terminal.deployment.yaml`

```yaml
- op: add
  path: "/spec/replicas"
  value: 2

- op: add
  path: "/spec/template/spec/containers/0/resources"
  value:
    limits:
      memory: "128Mi"
      cpu: "500m"

```

For last add `.k8s/overlays/production/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
commonLabels:
  environment: production
bases:
  - ../../base
patchesJson6902:
  - target:
      kind: Deployment
      name: terminal-app
      version: v1
    path: terminal.deployment.yaml
resources:
  - namespace.yaml

```

Now we can change the directory, and run `kustomize build`, and notice how this environament has been updated.