## Installing Helm

To install Helm on your OS read the instructions on following [link](https://helm.sh/docs/intro/install/) 

## Installing on local cluster with Helm

> You need a Kubernetes cluster and Helm install on your system, you can use `.playground` and VSCode dev containers to obtain the desired environment.

Helm 3 is not configured by default to use any repository. So if you want to install existing packages you have to add at least one repository containing some charts.

```bash
helm repo add stable https://kubernetes-charts.storage.googleapis.com/
```

The above repo is no longer available, use this one instead:

```bash
helm repo add stable https://charts.helm.sh/stable
```

With the previous command we're adding locally a new repository `stable` remotely located at `https://charts.helm.sh/stable`

To install a package

```bash
helm install demo-mysql stable/mysql
```

We can check that is running by

```bash
kubectl get all | grep mysql
```

We get an output similar to this

```
pod/demo-mysql-54f494495d-xd8kf   1/1     Running   0          46s
service/demo-mysql   ClusterIP   10.110.9.243   <none>        3306/TCP   46s
deployment.apps/demo-mysql   1/1     1            1           46s
replicaset.apps/demo-mysql-54f494495d   1         1         1       46s
```

To clean the previous helm installation

```bash
helm uninstall demo-mysql
```

We can check that the cluster is clean by:

```bash
kubectl get all | grep demo-mysql
kubectl get secret | grep demo-mysql
```
