# Singleton Service

The Singleton Service pattern ensures only one instance of an application is active at a time and yet is highly available. This pattern can be implemented from within the application, or delegated fully to Kubernetes.

## Singleton Use Cases

* Periodically task that mus be run just by one to avoid duplication
* Polling on a specific resource (file system, database), and we want to ensure a single instance
* Consume messages in order

## Solution

* On instance is active and the other ones are passive

This can be achived on two different ways.

### Out-of-Application Locking

* Managing the process outside of the application

The way to achieve this on K8s is by start one Pod with one replica.

The main problem with this technique it's ensure that just one replica is running, especially when things goes wrong.

> Singletons favor consistency over availability.

* Singletons may accept incoming requests
  * Headless service (StatefulSet)

* Non strict singleton - ReplicaSet one replica + Regular Service
* Strict singleton - StatefulSet + headless Service

### Example Non Strict Singleton

```bash
kubectl apply -f non-strict.singleton.yml
```

Accesing with minikube

```bash
URL=$(minikube service --url single-greeting-svc)
```

```bash
curl $URL
```

```bash
kubectl delete -f non-strict.singleton.yml
```

### In-Application Locking

* Uses an external lock to only let one instance
* In K8s we can use etcd via K8s API
  * [Apache Camel Documentation](https://camel.apache.org/docs/)

