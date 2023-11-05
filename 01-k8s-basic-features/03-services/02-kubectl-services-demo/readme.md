# kubectl Services Demo

### Pre requisites

A running Kubernetes cluster and kubectl properly configured pointing to the cluster.

### Steps

1. Deploy three different pods, two of them using _nginx.deployment.yml_, and the other one using _nginx.pod.yml_

Create `nginx.deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  labels:
    app: my-nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-nginx
  template:
    metadata:
      labels:
        app: my-nginx
    spec:
      containers:
      - name: my-nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources: {}

```

Create `nginx.pod.yml`

```yml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-standalone
  labels:
    name: nginx-standalone
spec:
  containers:
  - name: nginx-standalone
    image: nginx:alpine
    ports:
      - containerPort: 80
    resources: {}

```

```bash
kubectl create -f nginx.deployment.yml
```

```bash
kubectl create -f nginx.pod.yml
```

```bash
kubectl get pods
```

```
NAME                        READY   STATUS    RESTARTS   AGE
my-nginx-6ff7745b59-926jt   1/1     Running   0          41s
my-nginx-6ff7745b59-pwzxz   1/1     Running   0          41s
nginx-standalone            1/1     Running   0          34s
```

2. Get into the stand alone pod

```bash
kubectl exec nginx-standalone -it -- sh
```

Now we can install `curl` using `apk`, the package manager for Alpine

```bash
/ # apk add curl
fetch http://dl-cdn.alpinelinux.org/alpine/v3.11/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.11/community/x86_64/APKINDEX.tar.gz
(1/4) Installing ca-certificates (20191127-r2)
(2/4) Installing nghttp2-libs (1.40.0-r1)
(3/4) Installing libcurl (7.67.0-r0)
(4/4) Installing curl (7.67.0-r0)
Executing busybox-1.31.1-r9.trigger
Executing ca-certificates-20191127-r2.trigger
OK: 24 MiB in 41 packages
```

3. Now we're going to grab the IP of one of the deployment's pod, open a new terminal and run:

```bash
kubectl get pod my-nginx-6ff7745b59-926jt -o yaml
```

Close to the bottom we have the _podIP_, in this case: `podIP: 172.17.0.7`, if we go back to the other terminal, we can use it:

```bash
/ # curl http://172.17.0.7
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

The problem with this approach is that I have to know the IP address in order to reach the pod. Let's creat a service to have another approach, create _clusterIP.service.yml_

```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-clusterip
spec:
  type: ClusterIP
  selector:
    app: my-nginx
  ports:
  - port: 8080
    targetPort: 80
```

```bash
kubectl apply -f clusterIP.service.yml
```

```bash
kubectl get services
```

```
NAME              TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
kubernetes        ClusterIP   10.96.0.1      <none>        443/TCP    63d
nginx-clusterip   ClusterIP   10.98.249.39   <none>        8080/TCP   60s
```

This service is applying to the pods on deployment because of the labels. We can use the service IP address to reach the deployment pods. Going back to the terminal executing on independent pod:

```bash
kubectl exec nginx-standalone -it -- sh
/ # curl http://10.98.249.39:8080
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

Because we're using a service, we have load balancing by default and DNS so we can do as follows:

```bash
/ # curl http://nginx-clusterip:8080
```

Let's delete the service

```bash
kubectl delete service nginx-clusterip
```

4. Create a new service _nodeport.service.yml_

```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: my-nginx
  ports:
  - port: 80
    targetPort: 80
    nodePort: 31000

```

```bash
kubectl apply -f nodeport.service.yml
```

```bash
kubectl get services
```

```
NAME             TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
kubernetes       ClusterIP   10.96.0.1      <none>        443/TCP        63d
nginx-nodeport   NodePort    10.99.89.234   <none>        80:31000/TCP   37s
```

To access our service using `minikube` run:

```bash
minikube service --url nginx-nodeport
http://192.168.64.6:31000
```

We can remove the service by running:

```bash
kubectl delete service nginx-nodeport
```

5. For last we're going to create a load balancer service, create _loadbalancer.service.yml_

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: my-nginx
  ports:
  - name: "80"
    port: 80
    targetPort: 80

```

```bash
kubectl apply -f loadbalancer.service.yml
```

> https://minikube.sigs.k8s.io/docs/handbook/accessing/

_minikube tunnel_ runs as a process, creating a network route on the host to the service CIDR of the cluster using the cluster’s IP address as a gateway. The tunnel command exposes the external IP directly to any program running on the host operating system.

```bash
minikube tunnel
```

Ask for _password_

```bash
kubectl get svc
NAME                 TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
kubernetes           ClusterIP      10.96.0.1     <none>        443/TCP        64d
nginx-loadbalancer   LoadBalancer   10.98.52.89   10.98.52.89   80:32004/TCP   51s
```

```bash
http://10.98.52.89
```

### Cleanup

```bash
kubectl delete service nginx-loadbalancer
kubectl delete deployment my-nginx
kubectl delete pod nginx-standalone
minikube tunnel --cleanup
```
