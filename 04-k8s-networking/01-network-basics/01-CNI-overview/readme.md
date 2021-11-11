# CNI Network Overview Overview

* Local Cluster - Calico CNI Plugin

## Steps

```bash
vagrant ssh master
```

Local Cluster - Calico CNI Plugin. Let's get all Nodes ant their IP information, INTERNAL-IP is the real IP of the Node

```bash
kubectl get nodes -o wide
```

We get this, and this is the `NODE Network` 

```
NAME            STATUS   ROLES                  AGE     VERSION   INTERNAL-IP   EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION       CONTAINER-RUNTIME
master-node     Ready    control-plane,master   4d15h   v1.21.4   10.0.0.10     <none>        Ubuntu 18.04.5 LTS   4.15.0-151-generic   docker://20.10.8
worker-node01   Ready    worker                 4d15h   v1.21.4   10.0.0.11     <none>        Ubuntu 18.04.5 LTS   4.15.0-151-generic   docker://20.10.8
worker-node02   Ready    worker                 4d15h   v1.21.4   10.0.0.12     <none>        Ubuntu 18.04.5 LTS   4.15.0-151-generic   docker://20.10.8
```

Let's deploy a basic workload, hello-world with 3 replicas to create some pods on the pod network. Open a new terminal anc `cd` into `01-network-basics/01-CNI-overview`

```bash
kubectl apply -f deployment.yml
```

Get all pods, we can see each Pod has a unique IP on the Pod Network. The Pod Network was defined with `192.168.0.0/16`. 

```bash
kubectl get pods -o wide
```

We get this, and notice we have IP allocated from this POD CIDR range `192.168.0.0/16`, at this level is `calico` who assigns this IP address.

```
NAME                           READY   STATUS    RESTARTS   AGE     IP               NODE            NOMINATED NODE   READINESS GATES
hello-world-54575d5b77-db9tv   1/1     Running   0          2m11s   192.168.158.2    worker-node02   <none>           <none>
hello-world-54575d5b77-rz8vs   1/1     Running   0          2m11s   192.168.87.198   worker-node01   <none>           <none>
hello-world-54575d5b77-vjr2r   1/1     Running   0          2m11s   192.168.158.3    worker-node02   <none>           <none>
```

Now let's see the IP configuration inside a POD:

```bash
PODNAME=$(kubectl get pods --selector=app=hello-world -o jsonpath='{.items[0].metadata.name}')
echo $PODNAME
kubectl exec -it $PODNAME -- /bin/sh
ip addr 
exit
```

We can see one ethernet interface (number 4), and we can see `inet 192.168.158.2/32 brd 192.168.158.2 scope global eth0`, this is the real POD IP inside of the POD network, so this POD will be able to reach other POD using its real address instead any NAT.

```
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
4: eth0@if8: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1480 qdisc noqueue state UP 
    link/ether a6:ee:aa:de:ef:4f brd ff:ff:ff:ff:ff:ff
    inet 192.168.158.2/32 brd 192.168.158.2 scope global eth0
       valid_lft forever preferred_lft forever
```

Now let's have a look on individual nodes network information on our cluster.  

Look at PodCIDR and also the annotations, specifically the annotation projectcalico.org/IPv4IPIPTunnelAddr: 192.168.77.128

Check out the Addresses: InternalIP, that's the real IP of the Node.
Check out: PodCIDR  (Single IPv4 or IPv6 Range), 
           PodCIDRs (Multiple IP Ranges, but only 1 IPv4 AND IPv6 Range)
But the Pods aren't on the Node's PodCIDR Network...why not? 
We're using the Calico Pod Network which is configurable, it's controlling the IP allocation.
Calico is using a tunnel interfaces to implement the Pod Network model. 
Traffic going to other Pods will be sent into the tunnel interface and directly to the Node running the Pod.
For more info on Calico's operations https://docs.projectcalico.org/reference/cni-plugin/configuration

```bash
kubectl describe node master | more
```

If we have a look into `Annotations`, we find two IP addresses:

```
Annotations:        kubeadm.alpha.kubernetes.io/cri-socket: /var/run/dockershim.sock
                    node.alpha.kubernetes.io/ttl: 0
                    projectcalico.org/IPv4Address: 10.0.0.10/24
                    projectcalico.org/IPv4IPIPTunnelAddr: 192.168.77.128
```

The first one is the real IP address of this NODE, the second one is the adddress of the tunel interface that is associated with this node. Calico network's going to use tunnels to exchange information between the nodes in a cluster so that the Pods running on the nodes in a cluster can use the real IPs independent of the underlying infrastructure. Pod traffic will go into the tunnel on one node and pop out of the tunnel on the destination node where that other Pod is living on that the Pod is trying to communicate to. 

If we scroll down, we will find:

```
Addresses:
  InternalIP:  10.0.0.10
  Hostname:    master-node
```

This is the actual network address information associated with this node. This is the address information associated with the node API object for this particular node. So we see Addresses, InternalIP, `10.0.0.10`. We also see the hostname `master-node`. 

If we scroll down again we find:

```
PodCIDR:                      192.168.0.0/24
PodCIDRs:                     192.168.0.0/24
```

There we have PodCIDR, and then PodCIDR as plural. Now normally what PodCIDR is is the range of IPs that are going to be assigned to Pods that are started on this node. Well that's not quite the case inside of the Calico Pod network, the pods' IPs are going to be allocated from that global class bpool. 

Now you might be wondering why there are two ranges here, PodCIDR and PodCIDRs plural. Well, if it's PodCIDR, you're going to be using a single IPv4 or IPv6 range to allocate from, and that's going to be indicated in the PodCIDR field. If we look at PodCIDRs plural, if you're using IPv4 and IPv6, then those would be the ranges that it'd be allocated from. So you have one of each stored in that PodCIDRs plural object field.

Let's move forward and look at some more network information about what's kind of going on inside of this Calico network.

```bash
kubectl get pods -o wide
```

We get the following output

```
NAME                           READY   STATUS    RESTARTS   AGE   IP               NODE            NOMINATED NODE   READINESS GATES
hello-world-54575d5b77-db9tv   1/1     Running   0          36m   192.168.158.2    worker-node02   <none>           <none>
hello-world-54575d5b77-rz8vs   1/1     Running   0          36m   192.168.87.198   worker-node01   <none>           <none>
hello-world-54575d5b77-vjr2r   1/1     Running   0          36m   192.168.158.3    worker-node02   <none>           <none>
```

These are the IPs associated with the individual Pods, like how can we figure out how traffic goes from master maybe over to worker‑node01 for a Pod running on that node. And the way that it does that is with routes. Inside `master` run:

```bash
route
```

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         _gateway        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     0      0        0 eth1
10.0.2.0        0.0.0.0         255.255.255.0   U     0      0        0 eth0
_gateway        0.0.0.0         255.255.255.255 UH    100    0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
192.168.77.128  0.0.0.0         255.255.255.192 U     0      0        0 *
192.168.77.144  0.0.0.0         255.255.255.255 UH    0      0        0 cali3695aa26d3f
192.168.77.145  0.0.0.0         255.255.255.255 UH    0      0        0 cali4dac41cf160
192.168.77.146  0.0.0.0         255.255.255.255 UH    0      0        0 cali497deb5a5f9
192.168.77.147  0.0.0.0         255.255.255.255 UH    0      0        0 cali2c7f21c75be
192.168.77.148  0.0.0.0         255.255.255.255 UH    0      0        0 cali3ad52b32597
192.168.87.192  worker-node01   255.255.255.192 UG    0      0        0 tunl0
192.168.158.0   worker-node02   255.255.255.192 UG    0      0        0 tunl0
```

Let's focus on these ones:

```
192.168.87.192  worker-node01   255.255.255.192 UG    0      0        0 tunl0
192.168.158.0   worker-node02   255.255.255.192 UG    0      0        0 tunl0
```

There we see `192.168.87.192` with a gateway of `worker-node01`. So any traffic destined for that network is going to get sent to **worker-node01's IP address**. How is it going to get there? Via the tunnel interface over here on the right. That's the target or destination interface that packets will go down if they need to reach that particular subnet. 

We can also see here that there's routes defined for the other networks running on each node in our cluster. And so with these routes, that's how this individual node is able to determine where to send this information. So if traffic is generated on `master` and it needs to get to a Pod on `worker-node01`, it's going to go into the tunnel interface based on this defined route. 

Let's move forward and look at the individual tunnel interface.

```bash
ip addr
```

We see

```
7: tunl0@NONE: <NOARP,UP,LOWER_UP> mtu 1480 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
    inet 192.168.77.128/32 scope global tunl0
       valid_lft forever preferred_lft forever
```

Is an interface of type IP and IP. It's got an IP address of `192.168.77.128`. So this is a real interface on this server that's going to receive the traffic. It's then going to receive that traffic and send it into a process, it's going to encapsulate it and send it on to the target node that's defined. And so let's look at this from the other perspective. Let's say we have to communicate to `worker‑node01`. 

Open up an SSH session into `worker‑node01`, cd into `00-installing-k8s/04-automated-local-k8s-setup`

```bash
vagrant ssh node01
```

On this side let's look at the IP addresses that are available. If we do an `ip addr` on `worker‑node1`, there we see I have a tunl0 interface on this system as well.

```bash
ip addr
```

```
8: tunl0@NONE: <NOARP,UP,LOWER_UP> mtu 1480 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
    inet 192.168.87.192/32 scope global tunl0
       valid_lft forever preferred_lft forever
```

So there we see `192.168.87.192`, so this is the other side of the tunl0. Traffic is going to come in onto the real interface of the node, which if we scroll up, we'll see is `10.0.0.11`, and then get de‑encapsulated and passed on into the Pod. 

```
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 08:00:27:23:f7:44 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.11/24 brd 10.0.0.255 scope global eth1
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fe23:f744/64 scope link 
       valid_lft forever preferred_lft forever
```

Now let's go see how that happens. 

```bash
route
```

And so in the route information here we have the routes for the Pod networks that are running on each node. So there we see a different perspective because now we're on `worker‑node01`. We have a route back to `master-node` and then also node 2. 

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         _gateway        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     0      0        0 eth1
10.0.2.0        0.0.0.0         255.255.255.0   U     0      0        0 eth0
_gateway        0.0.0.0         255.255.255.255 UH    100    0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
192.168.77.128  master-node     255.255.255.192 UG    0      0        0 tunl0
192.168.87.192  0.0.0.0         255.255.255.192 U     0      0        0 *
192.168.87.197  0.0.0.0         255.255.255.255 UH    0      0        0 cali5a8550e3af3
192.168.87.198  0.0.0.0         255.255.255.255 UH    0      0        0 cali6d8ff9bc555
192.168.158.0   worker-node02   255.255.255.192 UG    0      0        0 tunl0
```

We also have two additional routes on the bottom there.

```
192.168.87.197  0.0.0.0         255.255.255.255 UH    0      0        0 cali5a8550e3af3
192.168.87.198  0.0.0.0         255.255.255.255 UH    0      0        0 cali6d8ff9bc555
```

Where do those routes come from? Well, those routes are for Pods that are running on this individual node, and so as traffic comes in on that tunl0 interface, it's going to get de‑encapsulated, it's going to find the route for the Pod that it needs to get to, then get passed on into that individual Pod. 

## Recap

> Pod traffic moving between nodes is passed via tunnels, and this traffic goes into tunl0 interfaces based on routes defined on the nodes. Once that traffic has reached a destination node for the Pod that it's trying to reach, then there's going to be a route on that node that defines an interface that's exposed into the Pod.

## Cleanup

```bash
kubectl delete -f deployment.yml
```