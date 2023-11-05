## pod health demo

### Pre requisites

A running Kubernetes cluster and kubectl properly configured pointing to the cluster.

### Steps

Create `nginx-readiness-probe.pod.yml`

```yml
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx
  labels:
    name: my-nginx
    rel: stable
spec:
  containers:
    - name: my-nginx
      image: nginx:alpine
      ports:
        - containerPort: 80
      livenessProbe:
        httpGet:
          path: /index.html
          port: 80
        initialDelaySeconds: 15
        timeoutSeconds: 2
        periodSeconds: 5
        failureThreshold: 1
      readinessProbe:
        httpGet:
          path: /index.html
          port: 80
        initialDelaySeconds: 3
        periodSeconds: 5
        failureThreshold: 1
      resources:
        limits:
          memory: "128Mi"
          cpu: "500m"
```

We can start our pod

```bash
kubectl apply -f nginx-readiness-probe.pod.yml
pod/my-nginx created
```

If we use _describe_ we can find out, that everything is working as we expect.

```bash
kubectl describe pod my-nginx
```

```yaml
Containers:
  my-nginx:
    Container ID:   docker://d11a2902422a395c625014fefb589cecab30ba37494ab4c4a86341d1b53eb9ca
    Image:          nginx:alpine
    Image ID:       docker-pullable://nginx@sha256:6d76a25a64f6a9a873bded796761bf7a1d18367570281d73d16750ce37fae297
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Tue, 22 Jun 2021 11:34:16 +0200
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  128Mi
    Requests:
      cpu:        500m
      memory:     128Mi
    Liveness:     http-get http://:80/index.html delay=15s timeout=2s period=5s #success=1 #failure=1
    Readiness:    http-get http://:80/index.html delay=3s timeout=1s period=5s #success=1 #failure=1
    Environment:  <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-zpvwd (ro)
```

Now we can interact with the pod and remove _index.html_

```bash
kubectl exec my-nginx -it -- sh
```

Inside the container we can move to

```bash
/usr/share/nginx/html # ls
50x.html    index.html
/usr/share/nginx/html # rm index.html
```

If we run **kubectl describe pod my-nginx**

```
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  18m                default-scheduler  Successfully assigned default/my-nginx to minikube
  Normal   Pulled     37s (x2 over 18m)  kubelet, minikube  Container image "nginx:alpine" already present on machine
  Normal   Created    37s (x2 over 18m)  kubelet, minikube  Created container my-nginx
  Warning  Unhealthy  37s                kubelet, minikube  Liveness probe failed: HTTP probe failed with statuscode: 404
  Normal   Killing    37s                kubelet, minikube  Container my-nginx failed liveness probe, will be restarted
  Normal   Started    36s (x2 over 18m)  kubelet, minikube  Started container my-nginx
```

Let's see another example, create `./busybox-liveness-probe.pod.yml`

```yml
apiVersion: v1
kind: Pod
metadata:
  name: liveness
  labels:
    name: liveness
spec:
  containers:
    - name: liveness
      image: k8s.gcr.io/busybox
      resources:
        limits:
          memory: "64Mi"
          cpu: "50m"
      args:
        - /bin/sh
        - -c
        - touch /tmp/healthy; sleep 30; rm -f /tmp/healthy; sleep 600
      livenessProbe:
        exec:
          command:
            - cat
            - /tmp/healthy;
        initialDelaySeconds: 5
        periodSeconds: 5
```

```bash
kubectl apply -f busybox-liveness-probe.pod.yml
```

If we wait for a while and run **kubectl describe pod liveness** we will get

```bash
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  84s                default-scheduler  Successfully assigned default/liveness to minikube
  Normal   Pulling    33s (x2 over 82s)  kubelet, minikube  Pulling image "k8s.gcr.io/busybox"
  Normal   Pulled     32s (x2 over 80s)  kubelet, minikube  Successfully pulled image "k8s.gcr.io/busybox"
  Normal   Created    32s (x2 over 80s)  kubelet, minikube  Created container liveness
  Normal   Started    31s (x2 over 79s)  kubelet, minikube  Started container liveness
  Warning  Unhealthy  13s (x6 over 73s)  kubelet, minikube  Liveness probe failed: cat: can't open '/tmp/healthy;': No such file or directory
  Normal   Killing    13s (x2 over 63s)  kubelet, minikube  Container liveness failed liveness probe, will be restarted
```

### Cleanup

```bash
kubectl delete -f ./
```
