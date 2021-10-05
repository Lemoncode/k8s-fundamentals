## kubectl and yaml demo

### Pre requisites

A running Kubernetes cluster and kubectl properly configured pointing to the cluster.

## Steps

Create the `./nginx.pod.yml`

```yml
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx
  labels:
    name: my-nginx
spec:
  containers:
  - name: my-nginx
    image: nginx:alpine
    ports:
      - containerPort: 80
    resources:
      limits:
        memory: "128Mi"
        cpu: "500m"
```


```bash
$ kubectl create -f nginx.pod.yml --save-config
pod/my-nginx created
$ kubectl describe pod my-nginx
Name:         my-nginx
Namespace:    default
Priority:     0
Node:         minikube/192.168.64.3
Start Time:   Sat, 18 Apr 2020 21:52:36 +0200
Labels:       app=nginx
              rel=stable
Annotations:  Status:  Running
IP:           172.17.0.4
IPs:
  IP:  172.17.0.4
Containers:
  my-nginx:
    Container ID:   docker://56660ab37456fe1c8c7b6e0bbc24e3a9b8db4f74fa62a47e498a759902c0acd3
    Image:          nginx:alpine
    Image ID:       docker-pullable://nginx@sha256:b942ebabfeff14ec6a7cb7a4826fe1d2e8dd8b7db5e651b81e4bc9cd6c6e91dc
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Sat, 18 Apr 2020 21:52:36 +0200
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  128Mi
    Requests:
      cpu:        500m
      memory:     128Mi
    Environment:  <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-wx46j (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  default-token-wx46j:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-wx46j
    Optional:    false
QoS Class:       Guaranteed
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  42s   default-scheduler  Successfully assigned default/my-nginx to minikube
  Normal  Pulled     42s   kubelet, minikube  Container image "nginx:alpine" already present on machine
  Normal  Created    42s   kubelet, minikube  Created container my-nginx
  Normal  Started    42s   kubelet, minikube  Started container my-nginx
```

_describe_ is great to get information about the pod and the image.

```bash
$ kubectl get pod my-nginx -o yaml
```
The _--save-config_ added anotations, if we add modifications it knows the starting point.

```yaml
kind: Pod
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"Pod","metadata":{"annotations":{},"labels":{"name":"my-nginx"},"name":"my-nginx","namespace":"default"},"spec":{"containers":[{"image":"nginx:alpine","name":"my-nginx","ports":[{"containerPort":80}],"resources":{"limits":{"cpu":"500m","memory":"128Mi"}}}]}}
# .......
```

```bash
$ kubectl apply -f nginx.pod.yml 
pod/my-nginx unchanged
```

_apply_ we can use to create or update, for exmple changing the nginx image. You can't change the ports

```bash
kubectl exec my-nginx -it -- sh
/ # ls
bin    dev    etc    home   lib    media  mnt    opt    proc   root   run    sbin   srv    sys    tmp    usr    var
```

```bash
$ kubectl edit -f nginx.pod.yml 
Edit cancelled, no changes made.
```

_edit_ pops up and editor (vim)

```bash
$ kubectl delete -f nginx.pod.yml 
pod "my-nginx" deleted
```
