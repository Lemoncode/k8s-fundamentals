## Pod Core Concepts

> Kubernetes definition of Pod: A Pod is the basic execution unit of a Kubernetes application -the smallest and simplest unit in the Kubernetes object model that you create or deploy.

* Kubernetes Pods
    - Smallest object of the Kubernetes object models
    - Environment for containers
    - Organize application "parts" into Pods (server, caching, APIs, database, etc.)
    - Pod IP, memory, volumes, etc. shared across containers
    - Scale horizontally by adding Pod replicas
    - Pods live and die but never come back to life.

Pods within a node have a unique IP address, and this by default will be a cluster IP, and then the containers within pods can have their own unique ports. Pod containers share the same network namespace, they share the same IP. They're going to use the same loopback network interface within a pod, that's localhost, so if one needs to talk to another, that's going to be very simple, and just using that local loopback. 

Container processes within the same pod need to have a different port. The pod itself gets a unique IP address, but the ports if you had multiple containers within a pod to be unique. 

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

As a `pod` is started, it's going to get a cluster IP address. A cluster IP address is only exposed to the nodes and the pods within a given cluster and it's not accesible outside of the cluster. 

We need to expose the pod port to be able to get be able to get to it, we can run __kubectl port-fordward command__, give it a pod name, and then we can give it ports. 

_8080_ is the extenal pod, _80_ internal port, that would be the port that the container is actually running on inside the `pod`, but what it does is it exposes that port through the nodes so that we can all into it. 

This is kind of the most basic way that you can do this port fordwarding.

* Deleting a Pod
    - Running a Pod will cause a deployment to be created
    - To delete a Pod use __kubectl delete pod__ or find the deployment and use kubectl delete deployment

```bash
kubectl delete pod [name-of-pod]
```

Will cause pod to be recreated

```bash
kubectl delete deployment [name-of-deployment]
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
4. YAML lists can define a sequence of maps

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
kubetcl create -f file.pod.yml --dry-run=client --validate=true

# Create a Pod from YAML
# Will error if Pod already exists
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
# Use --save-config when you want to use
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

In place/non-disructive changes can also be made to a Pod using _kubectl edit_ or _kubectl patch_.

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

[kubectl and YAML - DEMO](02-kubectl-and-yaml-demo/readme.md)


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
5. Specifies that the kubelet should perform a liveness probe every 5 seconds.
6. Allow 1 failure before failing the Pod

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

1. Define args for container
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

## Pod Health Demo

[Pod Health - DEMO](03-pod-health-demo/readme.md)

