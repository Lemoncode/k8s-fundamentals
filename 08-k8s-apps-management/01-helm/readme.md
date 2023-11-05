# Introduction

## Why Helm?

* `kubectl` don't install the application as an atomic set of Kubernetes objects.
* With `kubectl` you deploy each object separately.
* With `kubectl` you don't have the concept of an application's version.
* With `kubectl` to make a rollback on application version you have to track installation history by hand.

However, these objects may depend on each other, and the order in which you install them is usually also important. So we would like to group these related objects in a package and install that package as one single entity.

## What is Helm

> Helm is a package manager for Kubernetes

* The packages are called charts
* Helm is the package manager that manages those charts.

> Kubernetes can be seen as an operating system for a cluster of machines. It completely abstracts the infrastructure so any useful technology for an operating system, such as package manager, can be replicated to it.

## Kubernetes and Helm

How does Helm work? Instead of using `kubectl` for each K8s object, we embed the object definitions in a **package called chart**.

Then **Helm connects** to the `K8s API` to create the K8s objects.

The Helm library uses the `K8s client` to communicate with the K8s API, it uses `REST K8S API` and its security layer as any other client.

With Helm, you install your application as an entity defined by your chart and not as a set of independent Kubernetes objects. The chart is the definition of your application, and the release is an instance of that chart.

Where does Helm store the release configuration and history? Helm stores released manifests inside Kubernetes as secrets. Provides a kind of persistence and history for all the different releases installed with Helm. It's centralized in the cluster, and it's stored in the same namespace as your application. 

## Demos structured

## References

https://codefresh.io/docs/docs/new-helm/helm-best-practices/