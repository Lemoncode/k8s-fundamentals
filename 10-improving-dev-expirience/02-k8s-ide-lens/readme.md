# Lens

## Managing K8s with built in tools

Managing multiple Kubernetes clusters usually come to the few challenges besides the fact that you need to remember all your `kubectl commands`. Let's assume you have two clusters of different kinds, like  an `EKS`, and a `minikube cluster` that are all running different Kubernetes versions.

After we have deployed our cluster (**before start section**), notice that if we run, `kubectl version`, we get this:

```bash
Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:31:21Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"19+", GitVersion:"v1.19.13-eks-8df270", GitCommit:"8df2700a72a2598fa3a67c05126fa158fd839620", GitTreeState:"clean", BuildDate:"2021-07-31T01:36:57Z", GoVersion:"go1.15.14", Compiler:"gc", Platform:"linux/amd64"}
WARNING: version difference between client (1.21) and server (1.19) exceeds the supported minor version skew of +/-1
```

> WARNING: version difference between client (1.21) and server (1.19) exceeds the supported minor version skew of +/-1

In a typical environment, **you'd have a workstation with a specific kubectl version**. That workstation would also have the configurations to access your clusters, which would **usually be stored in a single kubectl config file**. 

The first caveat is that you can only access one cluster at a time as you can only have one active context.

We could try to work around this by having two different `kubectl` installations, including two different configuration files. This would solve our issue at the cost that you would always have to need to call a specific version of `kubectl` for your connection, or you could even go one step further and have different workstations with different kubectl versions, which obviously adds a lot of overhead. 

## What is Lens?

All these issues are being targeted by Lens. In the case of Lens, you would have multiple kubectl versions installed at a time and Lens would automatically pick the right version to connect to each of your clusters, simultaneously. 

Instead of using separate dashboards for each of your Kubernetes clusters, you would have built‑in central monitoring within Lens. 

Lens is a cross‑platform graphical user interface, which also makes it a great helper for those that don't interact with Kubernetes on a daily basis, and it works with any Kubernetes.

It can run deployment of workloads for either kubectl with an automatic version matching and through Helm. 

It comes with built‑in monitoring and troubleshooting features, and it allows the sharing of your Kubernetes configurations with your team. 

* Cross platform GUI for any Kubernetes
* Open source (Open Lens) and free EULS disttribution (Lens IDE)
* Deployments through `kubectl` (automatic version matching) and `Helm`
* Monitoring and troubleshooting
* Shareable configurations

## Demo: Installing Lens

[Demo: Installing Lens](01-installing-lens/readme.md)

## Adding clusters to Lens

To be able to connect to a Kubernetes cluster from Lens, you first have to add the configurations to Lens. 

There are multiple ways to do that. 

You can configure Lens to monitor **one or multiple kubectl config files**. Every cluster within those files will automatically be added to Lens. If a class gets added to these files, it will automatically appear in Lens as well. 

Instead of monitoring files, you can also monitor one or multiple folders. Following the same logic, whenever a cluster gets added to an existing or new config file, it will automatically get added to Lens. 

Any changes to an existing cluster, like it's IP address or certificate, will also automatically be reflected. 

Alternatively, you can manually paste a cluster configuration in Lens. This config will be stored in a separate file by Lens, and the cluster will also be added to your Lens installation. However, this requires you to mainly modify any changes that you may require for this cluster.

## Demo: Adding Clusters

[Demo: Adding Clusters](./01-adding-clsuters/readme.md)

## Deployment in Lens

Once your clusters are connected to Lens, other resources like namespaces, storage, network, config maps, custom resource definitions, and so on, are available for you in Lens. 

You can then use Lens to deploy workloads to that cluster by either using imperative kubectl commands, YAML, so declarative deployments, or Helm charts. 

You can also use Lens to scale your workloads, so at the push of a button we could, for example, increase or decrease the number of replicas in certain deployments, and the deployment will immediately scale up or down. 

In addition to that, you can also define your limits and quotas directly from Lens, which would then be applied to your Kubernetes cluster.

## Demo: Deploying and Managing Workoloads

[Demo: Deploying and Managing Workoloads](./02-deploying-and-managing-workloads/readme.md)

## Troubleshooting

We can also use Lens to troubleshoot our Kubernetes clusters. We've already seen the monitoring capabilities, but in addition to that, we can use Lens to open a shell within our nodes or within our Pods. We can attach to specific Pods to read the standard output, and, of course, we can also access the log files of every single container in our Pods.

## Demo: Troubleshooting

[Demo: Troubleshooting](03-troubleshooting/readme.md)

## References

[Resource Quotas](https://unofficial-kubernetes.readthedocs.io/en/latest/concepts/policy/resource-quotas/)