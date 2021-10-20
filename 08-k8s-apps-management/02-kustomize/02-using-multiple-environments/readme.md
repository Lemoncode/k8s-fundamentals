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
    matchLabels:
      app: terminal-app
  template:
    metadata:
      labels:
        app: terminal-app
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
  selector:
    app: terminal-app
  ports:
    - port: 80
      targetPort: 4000
      protocol: TCP

```

Here we only have two files, but it could be many more.