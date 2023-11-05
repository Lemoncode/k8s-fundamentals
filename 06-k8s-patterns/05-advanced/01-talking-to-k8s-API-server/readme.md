# Talking to the Kubernetes API server

To get the server API URL, we can run:

```bash
kubectl cluster-info
```

The server uses HTTPS and requires authentication. We can try with `curl --insecure`

```bash
curl <API server IP> -k
```

```json
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "forbidden: User \"system:anonymous\" cannot get path \"/\"",
  "reason": "Forbidden",
  "details": {},
  "code": 403
}
```

Luckily, rather than dealing with authentication yourself, you can talk to the server through a proxy by running the `kubectl proxy` command.

`kubectl proxy` command runs a proxy server that accepts HTTP connections on your local machine and proxies them to the API server while taking care of authentication, so you don’t need to pass the authentication token in every request. It also makes sure you’re talking to the actual API server and not a man in the middle (by verifying the server’s certificate on each request).

```bash
kubectl proxy
```

## Talking to the API server 

To talk to the API server from inside a POD we need to take care:

* Find the location of the API server
* Make sure you're talking to the API server and not something impersionating it.
* Authenticate with the server; otherwise it won't let you see or do anything

Now we need a POD with `curl`

> TODO: Create our own image

* Create `curl.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: curl
spec: 
  containers:
  - name: main
    image: jaimesalas/alpine-curl
    command: ["sleep", "9999999"]
```

```bash
kubectl apply -f ./curl.yaml
```


```bash
kubectl exec -it curl -- sh 
```

### Finding the API server's address

We need to find the IP and port of the Kubernetes API server.

```bash
kubectl get svc
```

We can also get them from environment variables, from a running container, inside a Pod, we can do:

```bash
env | grep KUBERNETES_SERVICE
```

Remember that each service also gets a DNS entry, we can just point to `https://kubernetes`

```bash
curl https://kubernetes
```

### Verifying the server's identity

Kubernetes automatically create a secret called `default-token-xyz`, which is mounted at `/var/run/secrets/kubernetes.io/serviceaccount`

```bash
ls /var/run/secrets/kubernetes.io/serviceaccount/
```

The secret has three entries `ca.crt`, `namespace` and `token`. To verify that we're talking to the API server, we need to check if the the server's certificate is signed by the CA.

```bash
curl --cacert /var/run/secrets/kubernetes.io/serviceaccount/ca.crt https://kuberenetes
```

> NOTE: We get *Unauthorized*

To avoid using `--cacert`, we can create an enviroment variable as follows:

```bash
export CURL_CA_BUNDLE=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
```

We can use now

```bash
curl https://kubernetes
```

### Authenticating with the API server

To authenticate you need and an authentication token. The token is provided through the default-token Secret, and is stored in the token file in the `secret` volume.

```bash
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
```

```bash
curl -H "Authorization: Bearer $TOKEN" https://kubernetes
```

If we're using a cluster with RBAC enabled the service account may not be authorized to access the API server:

```json
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "forbidden: User \"system:serviceaccount:default:default\" cannot get path \"/\"",
  "reason": "Forbidden",
  "details": {},
  "code": 403
}
```

We can set to default service account enough privileges to interact with API server, but instead of that we're going to create a new service account:

* Create `rbac.yml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: service-reader
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: svc-ro
rules:
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: svc-ro
  namespace: default
subjects:
- kind: ServiceAccount
  name: "service-reader"
  namespace: default
roleRef:
  kind: Role 
  name: svc-ro 
  apiGroup: rbac.authorization.k8s.io
```

Delete the `curl` pod

```bash
kubectl delete pod curl
```

Now lets update `curl` manifest so we add the service account with previous priveleges:

* Update `curl.yaml`

```diff
apiVersion: v1
kind: Pod
metadata:
  name: curl
spec: 
+ serviceAccountName: service-reader
  containers:
  - name: main
    image: jaimesalas/alpine-curl
    command: ["sleep", "9999999"]
```

Now lets create both resources:

```bash
kubectl apply -f ./rbac.yaml
kubectl apply -f ./curl.yaml
```

Now we can try to reach the server API

```bash
kubectl exec -it curl -- sh
```

And from inside the container:

```bash
export CURL_CA_BUNDLE=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
```

```bash
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
```

```bash
curl -H "Authorization: Bearer $TOKEN" https://kubernetes
```

Humm... It's not working, recall that on `role` we have defined only verbs around `services`, if we run:

```bash
curl -H "Authorization: Bearer $TOKEN" https://kubernetes/api/v1/namespaces/default/services
```

We get the services on `default` namespace.
