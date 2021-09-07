# Predicatble demands

In cloud world your applications are not going to live alone, they are going to be deployed in the same environment as many others, and they are going to be managed in this shared environment.

> Identify and declare the application resource requirements and runtime dependencies.

**Predictable Demands** pattern is about how you should declare application requirements, whether they are hard runtime dependencies or resource requirements.

Remember that K8s needs to find where to allocate them in the cluster.

## Problem

* It's difficult to find the resources that an application will need.
* Might be developers throw testing who find out.
* Application runtimes may have dependencies on storage 
* Application runtimes may have dependencies on configuration

## Solution

* Know container runtime requirements is important:
    - K8s can make intelligent decisions on where to place them
    - Capacity planning for cluster

## Runtime Dependencies

* File storage - If your application needs long lived (beyond the Pod live), you have to declare that dependency explicitly in the container.
    - The scheduler evaluates the kind of volume. **If the Pod needs a volume that is not provided by any node, the Pod is not scheduled at all**.
    - Similar, but not related with file storage, `hostPort` blocks the port on node.

* Application configuration - The solution offer by K8s `ConfigMaps`
    - If not all of the expected ConfigMaps are created, the containers are scheduled on a node, **but they not start up**.
    - With `Secrets` we have the same problem.

## Resource Profiles

We have two kind of resources:

* **compressible** - Can be throttled, CPU, network bandwidth.
* **incompressible** - Can not be throttled, memory.

If your containers consume to many **compressible** resources **they are throttled**, but if they consume to many **incompressible** they are killed.

Based on the nature and the implementation details of your application, you have to specify the minimum amount of resources that are needed (called *requests*) and the maximum amount it can grow up to (the *limits*).

The *requests* amount (but not *limits*) is used by the scheduler when placicing Pods to nodes. 

Depending on wether you specify the `requests` the `limits`, or both, the platform offers a different kind of Quality of Service

* **Best efforft** - No `requests`, no `limits`. **Pod is considered lowest priority** and is killed first when the node runs out of **incompressible** resources.
* **Burstble** - `requests` and `limits` defined **but they are not equal**. When node is running out fo **incompressible** resources, **these pods are likely to be killed if no Best-Effort remains**. 
* **Guaranteed** - `requests` and `limits` are equal. **These are the highest priority and guranteed not to be killed before the others**  

> The resource characteristics you define or omit for the containers have a direct impact on its QoS

## Pod Priority

Pod priority allows indicating the importance of a Pod relative to other Pods, which affects the order in which Pods are scheduled.

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: 
  name: high-priority # 1
value: 1000 # 2
globalDefault: false
description: Pod high priority class 
---
apiVersion: v1
kind: Pod
metadata:
  name: random-employee
  labels:
    name: random-employee
spec:
  containers:
  - name: random-employee
    image: jaimesalas/random-employee
    imagePullPolicy: Always
    resources: {}
  priorityClassName: high-priority # 3

```

1. The name of the priority class object
2. The priority value of the object - The higher value, more priority
3. The priority class to use with this Pod, as defined in PriorityClass resource

```bash
cd ./06-k8s-patterns/01-foundational/01-predictable-demands
```

```bash
kubectl apply -f ./pod-priority.yml
```

If we describe the pod now

```bash
kubectl describe pod random-employee
```

We will find out the priority set up:

```
Name:                 random-employee
Namespace:            default
Priority:             1000
Priority Class Name:  high-priority
Node:                 minikube/192.168.64.6
Start Time:           Tue, 07 Sep 2021 14:53:04 +0200
Labels:               name=random-employee
```

When **Priority feature is enabled**, it affects the order in which the `scheduler` **places Pods on nodes**. The **priority admission controller** uses `priorityClassName` field to populate the priority value for new Pods. When multiple Pods are waiting to be placed, the `scheduler` **sorts the queue of pending Pods by highest priority first**. Any pending Pod is picked before any other pending Pod with lower priority in the scheduling queue, and if there are no constraints preventing it from scheduling, the Pod gets scheduled.

> IMPORTANT: **If there are no nodes with enough capacity to place a Pod**, the **scheduler can preempt (remove) lower-priority Pods from nodes to free up resources and place Pods with higher priority**. As a result, the higher-priority Pod might be scheduled sooner than Pods with a lower priority if all other scheduling requirements are met.

`Pod QoS` and `Pod priority` are orthogonal features. 

* `QoS` is used primarily by the `Kubelet` to preserve node stability when available compute resources are low. The `Kubelet` first considers `QoS` and then `PriorityClass of Pods` before eviction. 

* The **scheduler eviction logic** ignores the `QoS of Pods` entirely when choosing preemption targets. The `scheduler` attempts to pick a set of Pods with the lowest priority possible that satisfies the needs of higher-priority Pods waiting to be placed.

> IMPORTANT: Pod priority must be used carefully

## Project Resource

`ResourceQuota`, provides constraints for limiting the aggregated resource consumption in a namespace. Administrators can limit the total sum of computing resources (CPU, memory) and storage consumed, even the number of objects created (`ConfigMaps`, `Secrets`, `Pods` or `Services`) created in a namespace.

`LimitRange`, allows setting resource usage limits for each type of resource. In addition to specifying the minimum and maximum permitted amounts for different resource types and the default values for these resources, it also allows you to control the ratio between the `requests` and `limits`, also known as the *overcommit level*. `LimitRanges` are useful to avoid containers that request more resources than the node can provide, they also prevent cluster users from creating containers that consume many resources.

## Capacity Planning

* **On development environments** it's ok to have all containers as *Best Effort* and *Burstable* resouce profiles.
* **On production environemnts** the conatiners might be *Guranteed* and some *Burstable*.

## Clean Up

```bash
kubectl delete -f ./
```

## Reference

[Kubernettes Patterns](https://k8spatterns.io/)
