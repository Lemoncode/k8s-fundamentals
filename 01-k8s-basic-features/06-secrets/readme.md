
## Secrets Core Concepts

A __Secret__ is an object that contains a small amount of sensitive data such as a password, a token, or a key.

* Secrets:
  - Kubernetes can store sensitive information (passwords, keys, certificates, etc.)
  - Avoid storing secrets in container images, in files, or in deployment manisfests
  - Mount secrets into pods as files or as environment variables
  - Kubernetes only makes secrets available to Nodes that have a Pod requesting the secret. This reduce the attack surface.
  - Secrets are stored in tmpfs on a Node (not on disk)

### Secrets Best Practice

* Enable encryption at rest for cluster data (https://kubernetes.io/docs/task/administer-cluster/encrypt-data)

* Limit access to etcd (where Secrets are stored) to only admin users

* Use SSL/TLS for etc peer-to-peer communication

* Manifest (YAML/JSON) files only base64 encode the Secret

* Pods can access Secrets so secure which users can create Pods. Role-based access control (RBAC) can be used.

## Creating a Secret

* Secrets can be created using `kubectl create secret`

```bash
# Create a secret and store securely in Kubernetes
kubectl create secret generic my-secret --from-literal=pwd=my-password

# Create a secret from a file 
kubectl create secret generic my-secret
  --from-file=ssh-privatekey=~/.ssh/id_rsa
  --from-file=ssh-publickey=~/.ssh/id_rsa.pub

# Create a secret from a key pair
kubectl create secret tls tls-secret --cert=path/to/tls.cert
  --key=path/to/tls.key
```

**Question**: Can I declaratively define secrets using YAML?
**Answer**: Yes, but any secret data is only base64 encoded in the manifest file! 

### Defining a secret in YAML

```yml
apiversion: v1
kind: Secret # 1
metadata:
  name: db-password # 2
type: Opaque
data:
  app-password: cFGFgpsd898e= # 3
  admin-password: cXYUP78ZxVRgpsd11223e=
```

1. Define a secret
2. Secret name
3. Keys/values for Secret

## Using a Secret

### Listing Secret Keys

A list of secrets can be retrieved using `kubectl get secrets`

```bash
# Get secrets
kubectl get secrets
```

```bash
kubectl get secrets db-password -o yaml
```

### Accessing a Secret: Environment Vars

Pods can access Secret values through environment vars
DATABASE_PASSWORD environment var created

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-passwords
type: Opaque
datadata:
  db-password: cFGFgpsd898e=
  admin-password: cXYUP78ZxVRgpsd11223e=
```

```yaml
apiVersion: apps/v1
...
spec:
  template:
    ...
  spec:
    containers: ...
    env:
    - name: DATABASE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-passwords
          key: db-password
```

### Accessing a Secret: Volumes

Pods can access Secret values through a volume
Each key is converted to a file - value is added into the file

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-passwords
type: Opaque
datadata:
  db-password: cFGFgpsd898e=
  admin-password: cXYUP78ZxVRgpsd11223e=
```

```yaml
apiVersion: apps/v1
...
spec:
  template:
    ...
  spec:
    volumes:
      - name: secrets
        secret:
          secretName: db-passwords
        containers:
        volumeMounts:
          - name: secrets
            mountPath: /etc/db-passwords
            readOnly: true

```

## Secrets Demo

[mongo deployement](01-k8s-basic-features/06-secrets/02-secrets-demo)
