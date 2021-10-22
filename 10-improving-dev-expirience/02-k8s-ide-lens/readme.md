After we have deployed our cluster, notice that if we run, `kubectl version`, we get this:

```bash
Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:31:21Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"19+", GitVersion:"v1.19.13-eks-8df270", GitCommit:"8df2700a72a2598fa3a67c05126fa158fd839620", GitTreeState:"clean", BuildDate:"2021-07-31T01:36:57Z", GoVersion:"go1.15.14", Compiler:"gc", Platform:"linux/amd64"}
WARNING: version difference between client (1.21) and server (1.19) exceeds the supported minor version skew of +/-1
```

> WARNING: version difference between client (1.21) and server (1.19) exceeds the supported minor version skew of +/-1

## Adding clusters to Lens

To be able to connect to a Kubernetes cluster from Lens, you first have to add the configurations to Lens. 

There are multiple ways to do that. 

You can configure Lens to monitor **one or multiple kubectl config files**. Every cluster within those files will automatically be added to Lens. If a class gets added to these files, it will automatically appear in Lens as well. 

Instead of monitoring files, you can also monitor one or multiple folders. Following the same logic, whenever a cluster gets added to an existing or new config file, it will automatically get added to Lens. 

Any changes to an existing cluster, like it's IP address or certificate, will also automatically be reflected. 

Alternatively, you can manually paste a cluster configuration in Lens. This config will be stored in a separate file by Lens, and the cluster will also be added to your Lens installation. However, this requires you to mainly modify any changes that you may require for this cluster.

## Demo: Adding Clusters

[Demo: Adding Clusters](./01-adding-clsuters/readme.md)