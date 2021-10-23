# Investigeting Cluster DNS

We're going to look at investigating `cluster DNS`, where we'll look at how it's deployed and how it's configured. And then we'll look at configuring CoreDNS to use custom forwarders, and we'll do this by editing the ConfigMap used to configure CoreDNS. And then for the final demo, we'll look at configuring `Pod DNS` configurations, where we'll deploy a Pod pointing to a `DNS server` that's outside of our cluster. 

So here we are with an SSH connection open to master, 

```bash
vagrant ssh master
```

Let's start off by investigating the **cluster DNS service**. 

```bash
kubectl get service ‑‑namespace kube‑system
```

This is going to give us a listing of all of the services that are available in `kube‑system`. The one that we're interested in, the service for `kube‑dns`. 

```
NAME             TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)                  AGE
kube-dns         ClusterIP   10.96.0.10     <none>        53/UDP,53/TCP,9153/TCP   4d20h
metrics-server   ClusterIP   10.109.15.83   <none>        443/TCP                  4d20h
```

Its service type is ClusterIP, and it has an assigned cluster IP of `10.96.0.10`. It's a multi‑port service, so here in the PORT(S) section, we can see it's running on **port 53** on both the **UDP and TCP protocols**. It also has an additional port 9153, running on TCP. 

Let's go ahead and use the command kubectl describe deployment to look closely at our CoreDNS deployment, and that's going to be the controller that manages the deployment of our CoreDNS Pods in our cluster. And so to do that, we can use kubectl describe deployment coredns, from the namespace kube‑system. 

```bash
kubectl describe deployment coredns --namespace kube-system | more
```

Let's kind of go through some of the important information that's available in this output. 

```
Name:                   coredns
Namespace:              kube-system
CreationTimestamp:      Mon, 23 Aug 2021 19:14:26 +0000
Labels:                 k8s-app=kube-dns
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               k8s-app=kube-dns
Replicas:               2 desired | 2 updated | 2 total | 2 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  1 max unavailable, 25% max surge
```

And so there we see Name is `coredns`, and then the Namespace `kube‑system`. Going on a little bit further, we see Replicas, that 2 are desired and that 2 are currently available. With this default configuration, we're going to get two Pods up and running, supporting our CoreDNS service. 


Going down a little bit further in the output inside of the Pod template here in the Containers section, we can see some arguments are defined, and so there we see `‑conf`, pointing to `etc/coredns/Corefile`, and that's the configuration file that will configure our CoreDNS service. 

```
Pod Template:
  Labels:           k8s-app=kube-dns
  Service Account:  coredns
  Containers:
   coredns:
    Image:       k8s.gcr.io/coredns/coredns:v1.8.0
    Ports:       53/UDP, 53/TCP, 9153/TCP
    Host Ports:  0/UDP, 0/TCP, 0/TCP
    Args:
      -conf
      /etc/coredns/Corefile
```


Let's look at where that file comes from exactly. And so here in the Mounts section, we can see that there's a mount at that `etc/coredns`. And that's coming from a volume named config‑volume. 

```
Requests:
      cpu:        100m
      memory:     70Mi
    Liveness:     http-get http://:8080/health delay=60s timeout=5s period=10s #success=1 #failure=5
    Readiness:    http-get http://:8181/ready delay=0s timeout=1s period=10s #success=1 #failure=3
    Environment:  <none>
    Mounts:
      /etc/coredns from config-volume (ro)
```

Inside of the Volumes section, we see config‑volume. That volume is of type ConfigMap and its name is coredns. 

```
Volumes:
   config-volume:
    Type:               ConfigMap (a volume populated by a ConfigMap)
    Name:               coredns
    Optional:           false
```

And inside of that ConfigMap, the data section is named `Corefile`. So going back up, **that's where we get the configuration file for our CoreDNS service**, from the **volume etc/coredns**, and from the `ConfigMap` in that data section named `Corefile`. 


Let's go ahead and break out of here and take a peek at that ConfigMap. 

```bash
kubectl get configmaps -n kube-system coredns -o yaml | more
```

And so inside of here we see `apiVersion: v1`, `data Corefile`, and so that's where that file name comes from. Inside of the data section for that `Corefile` is the **CoreDNS configuration**, and this **is the default configuration for our CoreDNS server**. 

Inside of there, we can see that the forward section is going to forward all domains and use the forwarders defined in the local `etc/resolv.conf` on the node that the Pod is going to be deployed on. So let's go ahead and break out of this output here and look at how we can customize our CoreDNS configuration.

```yaml
apiVersion: v1
data:
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
           max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
kind: ConfigMap
metadata:
  creationTimestamp: "2021-08-23T19:14:26Z"
  name: coredns
  namespace: kube-system
  resourceVersion: "240"
  uid: 8ae88f12-1eea-4cff-a4a6-01e85a3d56b9
```
