# Using Configuration Template

## Steps

### 1. Create deployment

Create `configuration-template.deployment.yml`

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
          image: jaimesalas/template-processor:0.0.1
          imagePullPolicy: Always
          env:
            - name: APP_PORT
              value: "3000"
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

```bash
kubectl apply -f configuration-template.deployment.yml
```

```bash
kubectl delete -f configuration-template.deployment.yml
```
