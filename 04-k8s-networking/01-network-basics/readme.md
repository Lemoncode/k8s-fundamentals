# Network basics

## Prerequisites

`cd` into `00-installing-k8s/04-automated-local-k8s-setup/Vagrantfile` and run `vagrant up`, this will start our local VMs cluster. Once the cluster is up and running, set kubectl context.

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

Have a quick view on cluster health by running:

```bash
kubectl get pods --all-namespaces 
```

The IP adresses of our nodes are:

```bash
10.0.0.10  master-node 
10.0.0.11  worker-node01 
10.0.0.12  worker-node02 
```

We can get into each of these VMs by running

```bash
vagrant ssh master
vagrant ssh node01
vagrant ssh node02
```