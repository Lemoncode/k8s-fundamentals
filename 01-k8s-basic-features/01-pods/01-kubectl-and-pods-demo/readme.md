## kubectl and pods demo

### Pre requisites

A running Kubernetes cluster and kubectl properly configured pointing to the cluster.

### Steps

```bash
$ kubectl get all

$ kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   20h
```

This returns just the Kubernetes service that we have running locally on this machine.

```bash
$ kubectl run my-nginx --image=nginx:alpine
pod/my-nginx created
```

Now we can inspect what we got now

```bash
$ kubectl get all
NAME           READY   STATUS    RESTARTS   AGE
pod/my-nginx   1/1     Running   0          72s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   20h
```

We can delete the pod

```bash
$ kubectl delete pod my-nginx
pod "my-nginx" deleted
$ kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   20h
```

Now we can use port forward to find out what is inside the pod

```bash
$ kubectl run my-nginx --image=nginx:alpine
$ kubectl port-forward my-nginx 8080:80
Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80

```
Now we can `google http://localhost:8080/` and we will find out `nginx` running. Now we can delete the pod as follows:

```bash
$ kubectl delete pod my-nginx
```

And we can verify that the pod is already deleted

```bash
$ kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   20h
```

* Working with Pods Using kubectl
    - Different `kubectl` commands can be used to run, view, and delete Pods

```
kubectl run [pod-name] --image=nginx:alpine
kubectl get pods
kubectl port-forward [pod-name] 8080:80
kubectl delete [pod-name]
```
