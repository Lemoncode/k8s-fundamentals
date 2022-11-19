# Automated Placement

*Automated Placement* is the core function from `scheduler` for asigning new Pods to nodes satisfying container resource requests and scheduling policies.

## Problem 

`microservices-based` system consists of tens or even hundreds of isolated processes. Containers and Pods do provide nice abstractions for packaging and deployment but do not solve the problem of placing these processes on suitable nodes.

Containers have dependencies among themselves, dependencies to nodes, and resource demands, and all of that changes over time too. The resources available on a cluster also vary over time, through shrinking or extending the cluster, or by having it consumed by already placed containers. The way we place containers impacts the availability, performance, and capacity of the distributed systems as well. 

## Solution

Kubernetes `scheduler`.

At a high level, the main operation the Kubernetes `scheduler` performs is to retrieve each newly created `Pod` definition from the `API Server` and assign it to a node. Finds a suitable node for every `Pod`, whether that is for the initial application placement, scaling up, or when moving an application from an unhealthy node to a healthier one. 

It does this by:
 - considering runtime dependencies 
 - resource requirements
 - guiding policies for high availability 
 - spreading Pods horizontally 
 - colocating Pods nearby for performance and low-latency interactions 

## Available Node Resources

Kubernetes cluster needs to have nodes with enough resource capacity to run new Pods. 

```
Allocatable = Node Capacity - Kube-reserved - System-Reserved
```

1. **Allocatable** - capacity for application pods
2. **Node Cpacity** - available capacity on a node
3. **Kube-Reserved** - Kubernetes daemons like kubelet, container runtime
4. **System-Reserved** - [OS system daemons like sshd, udev

> If containers are running on a node that is not managed by Kubernetes, the resources used by these containers are not reflected in the node capacity calculations by Kubernetes.

A workaround, **run a placeholder Pod that doesn’t do anything, but has only resource requests for CPU and memory corresponding to the untracked containers’ resource use amount**.

## Container Resource Demands

Another important requirement for an efficient Pod placement is that containers have their runtime dependencies and resource demands defined. 

## Placement Policies

The `scheduler` has a default set of predicate and priority policies configured that is good enough for most use cases. It can be overridden during scheduler startup with a different set of policies.

> Scheduler policies and custom schedulers can be defined only by an administrator as part of the cluster configuration. As a regular user you just can refer to predefined schedulers

```json
{
    "kind" : "Policy",
    "apiVersion" : "v1",
    "predicates" : [  
        {"name" : "PodFitsHostPorts"},                     // 1
        // ...
    ],
    "priorities" : [                       // 2
        // ...
    ]
}
```

1. Predicates are rules that filter out unqualified nodes. *PodFitsHostsPorts* schedules Pods to request certain fixed host ports only on those nodes that have this port still available.
2. Priorities are rules that sort available nodes according to preferences.

In addition to configuring the policies of the default scheduler, it is also possible to run multiple schedulers and allow Pods to specify which scheduler to place them. 

## Scheduling Process

Pods get assigned to nodes with certain capacities based on placement policies.

1. Pod is created (is not assigned to a node yet), 
2. The `Pod` gets picked by the `scheduler` together with **all the available nodes** and the set of **filtering and priority policies**. 
3. The `scheduler` **applies the filtering policies and removes all nodes that do not qualify based on the Pod’s criteria**. 
4. The remaining nodes get ordered by weight. 
5. Pod gets a node assigned, which is the primary outcome of the scheduling process.

On some occasions, you may want to force the assignment of a `Pod` **to a specific node or a group of nodes**. This assignment **can be done using a node selector**. `.spec.nodeSelector` is `Pod` field and **specifies a map of key-value pairs that must be present as labels on the node for the node to be eligible to run the Pod**. 

In addition to specifying custom labels to your nodes, you can use some of the default labels that are present on every node. Every node has a unique `kubernetes.io/hostname` label that can be used to place a Pod on a node by its hostname.

## Node Affinity

Kubernetes supports many more flexible ways to configure the scheduling processes. One such a feature is **node affinity**, which is a generalization of the node selector approach described previously that allows specifying rules as either **required** or **preferred**.

* **Required** rules must be met for a Pod to be scheduled to a node
* **Preferred** rules only imply preference by increasing the weight for the matching nodes without making them mandatory. 

## Pod Affinity and Antiaffinity

Node affinity works at node granularity, but Pod affinity is not limited to nodes and can express rules at multiple topology levels. Using the topologyKey field, and the matching labels, it is possible to enforce more fine-grained rules, which combine rules on domains like node, rack, cloud provider zone, and region.

## Taints and Tolerations

A more advanced feature that controls where `Pods` can be scheduled and are allowed to run is based on `taints` and `tolerations`. While node affinity is a property of Pods that allows them to choose nodes, `taints` and `tolerations` are the opposite. **They allow the nodes to control which Pods should or should not be scheduled on them**. A `taint` is a characteristic of the node, and when it is present, **it prevents Pods from scheduling onto the node unless the Pod has toleration for the taint**.

Taints and tolerations allow for complex use cases like having dedicated nodes for an exclusive set of Pods, or force eviction of Pods from problematic nodes by tainting those nodes.

## References

[Scheduling Configuration](https://kubernetes.io/docs/reference/scheduling/policies/)
[Scheduler Configuration](https://kubernetes.io/docs/reference/scheduling/config/)
[RedHat OpenShift](https://docs.openshift.com/container-platform/3.6/admin_guide/scheduling/scheduler.html)
