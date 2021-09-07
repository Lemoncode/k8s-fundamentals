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


