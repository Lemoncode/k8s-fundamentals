## Using an isolated VM - M1

## Prerequisites

* Install [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)

We are going to install `minikube` as a binary:

```bash
curl -LO https://storage.googleapis.com/minikube/releases/v1.26.1/minikube-darwin-arm64
sudo install minikube-darwin-arm64 /usr/local/bin/minikube
```

> Notice that we're using `v1.26.1`, the latest one is actually `1.27.0`, but this version is tied to `Kubernetes 1.25` that has an open issue with `/etc/resolv.conf`. 

## Linux

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

In our case we are going to install `1.21.0` to align with the required version by AWS EKS.

```bash
curl -LO https://storage.googleapis.com/minikube/releases/v1.21.0/minikube-linux-amd64
```

## Uninstall 

```bash
minikube stop
minikube delete --all
rm -rf ~/.minikube
sudo rm -rf /usr/local/bin/minikube
```

## minikube Smoke Test

> Docker must be running on your machine as long as the default driver is Docker.

To verify that minikube it's working run:

```bash
minikube start
```

We can check what is running on current cluster by:

```bash
kubectl get po -A
```

After running this command, you must get an output similar to this one:

```
NAMESPACE     NAME                               READY   STATUS    RESTARTS        AGE
kube-system   coredns-6d4b75cb6d-n87pd           1/1     Running   0               4m5s
kube-system   etcd-minikube                      1/1     Running   0               4m19s
kube-system   kube-apiserver-minikube            1/1     Running   0               4m18s
kube-system   kube-controller-manager-minikube   1/1     Running   0               4m18s
kube-system   kube-proxy-z4nbj                   1/1     Running   0               4m5s
kube-system   kube-scheduler-minikube            1/1     Running   0               4m18s
kube-system   storage-provisioner                1/1     Running   1 (3m58s ago)   4m17s
```

We can deploy a silly application and check that is reachable:

```bash
kubectl create deployment hello-minikube --image=docker.io/nginx:1.23
kubectl expose deployment hello-minikube --type=NodePort --port=80
```

If we have a look into the services 

```bash
kubectl get services hello-minikube
```

we can check that we have

```
NAME             TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
hello-minikube   NodePort   10.100.207.18   <none>        80:31629/TCP   5m22s
```

And expose it locally by running:

```bash
kubectl port-forward service/hello-minikube 7080:80
```

Clean resources:

```bash
kubectl delete svc hello-minikube
kubectl delete deployment hello-minikube
```

### LoadBalancer deployments

```bash
kubectl create deployment balanced --image=docker.io/nginx:1.23
kubectl expose deployment balanced --type=LoadBalancer --port=80
```

In another terminal run:

```bash
minikube tunnel
```

To find the IP run:

```bash
kubectl get svc balanced
```

```
NAME         TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
balanced     LoadBalancer   10.108.24.21   127.0.0.1     80:31266/TCP   94s
kubernetes   ClusterIP      10.96.0.1      <none>        443/TCP        31m
```

## References

[minikube get started](https://minikube.sigs.k8s.io/docs/start/)
[how to upgrade minikube](https://stackoverflow.com/questions/45002364/how-to-upgrade-minikube)
