## Services Core Concepts

> Kubernetes service definition: A Service provides a single point of entry for accessing one or more Pods

__Review Question:__ Since Pods live and die, can you rely on their IP?
__Answer__: NO! That's why we need Services - IP's change a lot!

* The life of a POD
    - Pods are mortal and may only live a short time (ephemeral)
    - You can't rely on a Pod IP address staying the same
    - Pods can be horizontally scaled so each Pod gets its own IP address
    - A Pod gets IP address after it has been scheduled (no way for clients to know IP ahead of time)

> Labels are really important here, because is the way that we can associate a Pod with a Service

* The Role of Services
    - Services abstract Pod IP addresses from consumers
    - Load balances between Pods
    - Relies on labels to associate a Service with a Pod
    - Node's kube-proxy creates a virtual IP for services
    - Layer 4 (TCP/UDP over IP)
    - Services are not ephemeral
    - Create endpoints which sit between a Service and Pod

> TODO: Add diagrams 

## Service Types

* Services can be defined in different ways:
    - ClusterIP - Expose the service on a cluster-internal IP (default)
    - NodePort - Expose the service on each Node's IP at a static port.
    - LoadBalancer - Provision an external IP to act as a load balancer for the service
    - ExternalName - Maps a service to a DNS name

## Creating a Service with kubectl

### Port Forwarding

__Question__: How can you acces a Pod from outside of Kubernetes?
__Answer__: Port forwarding. This is for debugging purpose.

* Use the kubectl port-forward to forward a local port to a Pod port

```bash
# Listen on port 8080 locally and forward to port 80 in Pod
kubectl port-fordward pod/[pod-name] 8080:80
```

```bash
# Listen on port 8080 locally and forward to port 80 in Pod
kubectl port-fordward deployment/[deployment-name] 8080
```

```bash
# Listen on port 8080 locally and forward to port 80 in Pod
kubectl port-fordward service/[service-name] 8080
```


### Port Forwarding Demo

[Port Forwarding Demo](01-port-forwarding-demo/readme.md)

## Creating a Service with YAML

### Service Overview

```yaml
apiVersion: v1 # 1
kind: Service 
metadata: # 2
spec:
  type: # 3

  selector: # 4

  ports: # 5
```

1. Kubernetes API version and resource type (Service)
2. Metadata about the Service
3. Type of service (ClusterIP, NodePort, LoadBalancer) defaults to ClusterIP
4. Select Pod template label(s) that service will apply to
5. Define container target port and the port for the service

```yaml
apiVersion: v1 # 1
kind: Service
metadata: # 2
  name: nginx
  labels:
    app: nginx
spec:
  selector: # 3
    app: nginx
  ports:
  - name: http # 4
    port: 80
    targetPort: 80
```

1. Kubernetes API version and resource type (Service)
2. Metadata about the Service
3. Service will apply to reources with a label off `app:nginx`
4. Define container target port(s) and the port(s) for the Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend # 1

---

apiVersion: v1
kind: Service
metadata:
  name: backend # 1  # 2

```

1. Name of service (each service gets a DNS entry)
2. A frontend Pod can access a backend Pod using `backend:port`

```yaml
apiVersion: v1
kind: Service
metadata:
    ...
spec:
  type: NodePort # 1
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    nodePort: 31000 # 2
```
1. Set service type to NodePort
2. Optionally set NodePort value (defaults between 30000-32767)


```yaml
apiVersion: v1
kind: Service
metadata:
    ...
spec:
  type: LoadBalancer # 1
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
```

1. Set Service type to LoadBalancer (normally used with cloud providers)

```yaml
apiVersion: v1
kind: Service
metadata:
    name: external-service # 1
spec:
  type: ExternalName # 2
  externalName: api.acmecorp.com # 3
  ports:
  - port: 9000
```

1. Other Pods can use this FQDN to access the external service
2. Set type to ExternalName
3. Service will proxy to FQDN

## kubectl and Services

* Creating a Service 
    - Use the __kubectl create__ command along with the --filename or -f switch

```bash
# Create a Service
$ kubectl create -f file.service.yml
```

* Updating or Creating a Service
    - Use the __kubectl apply__ command along with the --filename or -f switch

```bash
# Update a Service
# Assumes --save-config was used with create
$ kubectl apply -f file.service.yml
```

* Deleting a Service
    - Use the __kubectl delete__ command along with the --filename or -f switch.

```bash
# Delete a Service
$ kubectl delete -f file.service.yml
```

* Testing a Service and Pod with curl
    - How can you quickly test if a Service and Pod is working?
        * Use __kubectl exec__ to shell into a Pod/Container

```bash
# Shell into a Pod and test URL. Add -c [containerID]
# in cases where multiple containers are running in the POd
$ kubectl exec [pod-name] -- curl -s http://podIP
```

```bash
# Install and use curl (example shown is for Alpine Linux)
$ kubectl exec [pod-name] -it -- sh
> apk add curl
> curl -s http://podIP
```

## kubectl Services Demo

[kubectl services demo](02-kubectl-services-demo/readme.md)

