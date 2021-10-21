# Stateful Service

Distributed stateful applications require features such as persistent identity, networking, storage, and ordinality. The Stateful Service pattern describes the `StatefulSet` primitive that provides these building blocks with strong guarantees ideal for the management of stateful applications.

## Stateful Service Use cases

* Stateful applications in which every instance is unique and has long-lived characteristics.

We could deploy a stateful application like MongoDB, using a `Deployment` with a `ReplicaSet` with `replicas=1`, use a Service to discover its endpoint and PV - PVC

> The number of replicas can vary temporarily!

This could lead to data lose. 

> The challenge is when it is a distributed stateful service that is composed of multiple instances.

## Prerequisites for distributed stateful applications.

### Storage

If we have a ReplicaSet with one replica on a Stateful manner, and we want to move to distributed fashion, we can just increase the number of replicas. 

Each replica needs its own dedicated, persistent storage.

> A ReplicaSet with multiple replicas and a PersistentVolumeClaim (PVC) definition would result in all three Pods attached to the same PersistentVolume (PV).

### Networking

* A distributed stateful application requires a stable network identity.
* every instance should be reachable in a predictable address that should not change dynamically

### Identity

* Identity/name, some stateful aplications require unique persistent names.
* In K8s will be the Pod name, and if it's managed by a `ReplicaSet` will have a random name.

### Ordinality

* The instances of clustered stateful applications have a fixed position in the collection of instances.

## Solution

StatefulSet  is designed for managing nonfungible Pods, as opposed to ReplicaSet, which is for managing identical replaceable Pods.

### Demo: StatefulSet

[Demo: StatefulSet](01-statefulste-demo/readme.md)

