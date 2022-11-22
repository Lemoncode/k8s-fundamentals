# K8s API server amabassador

Now we're able to build a container that uses `curl` to communicate with K8S API server.

* Create `ambassador.sh`

```sh
#!/bin/sh
CERT="/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
K8S_API="https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT"
TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
/usr/local/bin/kubectl proxy --server="$K8S_API" --certificate-authority="$CERT" --token="$TOKEN" --accept-paths='^.*'
```

Here we're creating a script that will use `downward API` to get the certificate an related service account token. Now we can build a Dockerfile as follows:

```Dockerfile
FROM alpine

ARG ARCH="amr64"

RUN apk update && \
    apk add curl && \
     curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/$ARCH/kubectl && \
     chmod +x ./kubectl && \
     mv ./kubectl /usr/local/bin/kubectl
    
COPY ambassador.sh  /ambassador.sh 

RUN chmod +x /ambassador.sh 

ENTRYPOINT /ambassador.sh
```

Now we build and push the image:

```bash
chmod +x buildpush.sh 
```

```bash
./buildpush.sh "jaimesalas/ambassador-alpine"
```

Notice that the default architecture it's `arm64`, you can feed a different architecture, by feeding as second argument.

Now we can create a `pod` with access to the K8s API

> EXERCISE: Create the pod that can communicate 

* Create `curl-ambassador.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: curl-ambassador
spec: 
  serviceAccountName: service-reader
  containers:
  - name: main
    image: jaimesalas/alpine-curl
    command: ["sleep", "9999999"]
  - name: ambassador
    image: jaimesalas/ambassador-alpine
```

```bash
kubectl apply -f ./curl-ambassador.yaml
```

No we can get into the `main` container and check that we can access API server from `localhost:8001`

```bash
kubectl exec -it curl-ambassador -c main -- sh
```