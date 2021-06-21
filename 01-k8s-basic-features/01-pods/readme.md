## Pod Core Concepts

> Kubernetes definition of Pod: A Pod is the basic execution unit of a Kubernetes application -the smallest and simplest unit in the Kubernetes object model that you create or deploy.

* Kubernetes Pods
    - Smallest object of the Kubernetes object models
    - Environment for containers
    - Organize application "parts" into Pods (server, caching, APIs, database, etc.)
    - Pod IP, memory, volumes, etc. shared across containers
    - Scale horizontally by adding Pod replicas
    - Pods live and die but never come back to life.

Pods within a node are going to have a unique IP address, and this by default will be a cluster IP address it's called, and then the containers within pods can have their own unique ports. So pod containers share the same network namespace, they share the same IP. Now they're going to use the same loopback network interface within a pod, that's localhost so if one needs to talk to another, that's going to be very simple, and just using that local loopback. Now container processes within the same pod need to have a different port. The pod itself gets a unique IP address, but the ports if you had multiple containers within a pod to be unique. 

* Pod containers share the same Network namespace (share IP/port)
* Pod containers have the same loopback network interface (localhost)
* Container processes need to bind to different ports within a Pod
* Ports can be reused by containers in separate Pods

> TODO: Add diagram.

Pods do not span nodes

> TODO: Add diagram

## Creating a Pod

* Running a Pod
    - There are several different ways to schedule a Pod:
        * kubectl run command
        * kubectl create/apply command with a yaml file

```bash
kubectl run [podname] --image=nginx:alpine
```

* List only pods

```bash
kubectl get pods
```

* List all resources

```bash
kubectl get all
```

* Get information about a Pod
    - The `kubectl get` command can be used to retrieve information about Pods and many other Kubernetes objects.

* Expose a Pod Port
     - Pods and containers are only accesible within the Kubernetes cluster by default
     - One way to expose a container port externally: `kubectl port-fordward`

```bash
kubectl port-forward [name-of-pod] 8080:80
```

As a pod is brought to life, it's going to get a cluster IP address. Now a cluster IP address is only exposed to the nodes and the pods within a given cluster and it's not accesible outside of the cluster. We need to expose the pod port to be able to get be able to get to it, we can run __kubectl port-fordward command__, give it a pod name, and then we can give it ports. 

_8080_ is the extenal pod, _80_ internal port, that would be the port that the container is actually running on inside the pod, but what it does is it exposes that port through the nodes so that we can all into it. This is kind of the most basic way that you can do this port fordwarding.

* Deleting a Pod
    - Running a Pod will cause a deployment to be created
    - To delete a Pod use __kubectl delete pod__ or find the deployment and use kubectl delete deployment

```bash
kubectl delete pod [name-of-pod]
```

Will cause pod to be recreated

```bash
kubectl delete deployement [name-of-deployment]
```

## kubectl and Pods

[kubectl and pods - DEMO](01-kubectl-and-pods-demo/readme.md)

## YAML Fundamentals

* YAML Review
    - YAML files are composed of maps and lists
    - Identation matters (be consistent!)
    - Always use spaces
    - Maps:
        * name: value pairs
        * Maps can contain other maps for more complex data structures
    - List:
        * Sequence of items
        * Multiple maps can be defined in a list

```yml
key: value # 1
complexMap: # 2
  key1: value
  key2:
    subKey: value
items: # 3
  - item1
  - item2
itemsMap: # 4
  - map1: value
    map1Prop: value
  - map2: value
    map2Prop: value
```

1. YAML maps define a key and a value
2. More complicated map structures can be defined using a key that references another map
3. YAML lists can be used to define a sequence of items
4. YAML lists can define a sequence maps

> Note: Identation matters, use spaces not tabs

## Defining a Pod with YAML

```yml
apiVersion: v1 # 1
kind: Pod # 2
metadata: # 3.
  name: my-nginx
spec: # 4
  containers: # 5
  - name: my-nginx
    image: nginx:alpine
```

1. Kubernetes API version [kubernetes docs](https://kubernetes.io/docs)
2. Type of resource
3. Metadata about the POd
4. The spec/blueprint for the Pod
5. Information about the containers that will run in the Pod

* Creating a Pod using YAML
    - To create a pod using YAML use the kubetcl create command along with the --filename or -f switch

```bash
# Perform a "trial" create and also validate the YAML
kubetcl create -f file.pod.yml --dry-run --validate=true

# Create a Pod from YAML
# Will error if Pod alreadt
kubectl create -f file.pod.yml
```

* Creating or Applying Changes to a Pod
    - To create or apply changes to a pod using YAML use the kubectl apply command along with the  --filename or -f switch

```bash
# Alternate way to create or apply to a 
# Pod from YAML
kubectl apply -f file.pod.yml
```

This way we can create a resource and also update an existing resource

```bash
# Use --save-config when you waant to use
# kubectl apply in the future
kubectl create -f file.pod.yml --save-config
```

__--save-config__ Store current properties in resource's annotations, then when we use _apply_ will read whatever is here and apply specific settings.

Using kubectl create --save-config

```yml
apiVersion: v1
kind: Pod
metadata:
  
  annotations:
    kubectl.kubernetes.io/
    last-applied-configuration:
    {"apiVersion":"v1", "kind":"Pod",
     "metadata":{
       "name": "my-nginx"
     }
    }
```

* --save-config causes the resource's configuration settings to be saved in the annotations
* Having this allows in-place changes to be made to a Pod in the future using __kubectl apply__

In place/non-disruotive changes  can also be made to a Pod using _kubectl edit_ or _kubectl patch_.

* Deleting a Pod
    - To delete a Pod use kubectl

```bash
# Delete Pod
kubectl delete pod [name-of-pod]
```

```bash
# Delete Pod using YAML file that created it
kubectl delete -f file.pod.yml
```

## kubectl and YAML

```bash
Jaimes-MacBook-Pro:01_creating_pods jaimesalaszancada$ kubectl create -f nginx.pod.yml --save-config
pod/my-nginx created
Jaimes-MacBook-Pro:01_creating_pods jaimesalaszancada$ kubectl describe pod my-nginx
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

```bash
$ kubectl apply -f nginx.pod.yml 
pod/my-nginx unchanged
```

_apply_ we can use to create or update, for exmple changing the nginx image. You can't change the ports

```bash
$ kubectl exec my-nginx -it sh
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl kubectl exec [POD] -- [COMMAND] instead.
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

## Pod Health

Kubernetes relies on Probes to determine the health of a Pod container.

A Probe is a diagnostic periodically by the kubelet on a container.

* Types of Probes
  - Liveness Probe
  - Readiness Probe

* Livenes probes can be used to determine if a Pod is healthy and running as expected
* Readiness probes can be used to determine if a Pod should receive requests
* Failed Pod containers are recreated by default (restartPolicy defaults to Always)

* __ExecAction__ - Executes an action inside the container
* __TCPSocketAction__ - TCP check against the container's IP address on a specified port
* __HTTPGetAction__ - HTTP GET request against container

* Probes can have the following results:
  - Success
  - Failure
  - Unknown

Example of an __HTTP Liveness Probe__

```yml
apiVersion: v1
kind: Pod
...
spec:
  containers:
  - name: my-nginx
    image: nginx:alpine
    livenessProbe: # 1
      httpGet:
        path: /index.html # 2
        port: 80
      initialDelaySeconds: 15 # 3
      timeoutSeconds: 2 # 4
      periodSeconds: 5 # 5
      failureThreshold: 1 # 6
```

1. Define liveness probe
2. Check /index.html on port 80
3. Wait 15 seconds
4. Timeout after 2 seconds
5. Allow 1 failure before failing the Pod

We can see another example

```yml
apiVersion: v1
kind: Pod
...
spec:
  containers:
  - name: liveness
    image: k8s.gcr.io/busybox

    args: # 1
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30;
      rm -rf /tmp/healthy; sleep 600

    livenessProbe: # 2
      exec:
        command: # 3
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
```

1. Define args for conatainer
2. Define liveness probe
3. Define action/command to execute

Here for a period of time this is going to work but after a bit it will fail, and new container will be bring up to life.

Defining a Readiness Probe

```yml
apiVersion: v1
kind: Pod
...
spec:
  containers:
  - name: my-nginx
    image: nginx:alpine
    readinessProbe: #1
      httpGet:
        path: /index.html #2
        port: 80
      initialDelaySeconds: 2 #3
      periodSeconds: 5
```

1. Define readiness probe
2. Check /index.html on port 80
3. Wait 2 seconds

> Readiness Probe: When should a container start receiving traffic?
> Liveness Probe: When should a container restart?

## Pod Health in Action

We can start our pod

```bash
Jaimes-MacBook-Pro:01_creating_pods jaimesalaszancada$ kubectl apply -f nginx-readiness-probe.pod.yml 
pod/my-nginx created
```

If we use _describe_ we can find out, that everything is working as we expect.

```bash
$ kubectl describe pod my-nginx
```

Now we can interact with the pod and remove _index.html_

```bash
$ kubectl exec my-nginx -it sh
```

Inside the container we can move to

```bash
/usr/share/nginx/html # ls
50x.html    index.html
/usr/share/nginx/html # rm -rf index.html
/usr/share/nginx/html # command terminated with exit code 137
```

If we run __kubectl describe pod my-nginx__

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

Let's see another example

```bash
$ kubectl apply -f busybox-liveness-probe.pod.yml
```

If we wait for a while we will get 

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
