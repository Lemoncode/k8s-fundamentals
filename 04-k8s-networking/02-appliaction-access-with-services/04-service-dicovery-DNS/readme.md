# Service Discovery - DNS

So here we are logged into `master`, and let's go through working with a service discovery, and we're going to look at DNS. 

```bash
vagrant ssh master
```

The first thing that we're going to do is to create a deployment in the default namespace, and then we're also going to go ahead and expose that as a service, we'll do that with kubectl exposed, and we're also going to define it as type ClusterIP. 

```bash
kubectl create deployment hello-world-clusterip \
  --image=gcr.io/google-samples/hello-app:1.0
```

Output

```
deployment.apps/hello-world-clusterip created
```

```bash
kubectl expose deployment hello-world-clusterip \
  --port=80 --target-port=8080 --type ClusterIP
```

We want to be able to run DNS queries against our cluster DNS server. If we just ran DNS queries from `master`, we would actually use the node's local DNS servers as defined in `etc/resolv.conf`. 

Let's go ahead and grab our cluster DNS, DNS ServiceIP, and use that so we could send queries directly to that service, and with kubectl get service kube‑dns from the namespace kube‑system:

```bash
kubectl get service kube-dns --namespace kube-system
```
we can see that the ClusterIP for our DNS service is `10.96.0.10`. 

```
NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   5d17h
```

We can use `nslookup` to query our DNS server, ee are going to pass in a DNS record, hello‑world‑clusterip.default.svc.cluster.local, and let's walk through that DNS name together.

```bash
nslookup hello-world-clusterip.default.svc.cluster.local 10.96.0.10
```

We can see the service name, `hello‑world‑clusterip`, then default, which is the namespace that service was created in, then we see the static string `SVC`, followed by our cluster domain name, which is `cluster.local`. Now we're going to send that DNS query directly to our cluster DNS service at `10.96.0.10`, that's going to run that code there, and we can see we get a result:

```
Server:         10.96.0.10
Address:        10.96.0.10#53

Name:   hello-world-clusterip.default.svc.cluster.local
Address: 10.106.64.74 
```
We can see the server that we sent a query to was `10.96.0.10`. The name that we asked for was our `hello‑world‑clusterip.default.svc.cluster.local` name, and then it returned to us the address, `10.106.64.74`, and let's go ahead and verify to make sure that that's actually our cluster IP, and we can do that with kubectl get service hello‑world‑clusterip: 

```bash
kubectl get service hello-world-clusterip
```

And in this output there, we can confirm that we got the right address back, `10.106.64.74`, and so each service that gets created is going to get a DNS record created in cluster DNS, just like we looked at here. 

```
NAME                    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
hello-world-clusterip   ClusterIP   10.106.64.74   <none>        80/TCP    97m
```


Let's do another example inside of a namespace. We're going to create a namespace with kubectl create namespace ns1, we're going to create a deployment named hello‑world‑clusterip, and we're going also to expose it as a service. 

```bash
kubectl create namespace ns1
```

```bash
kubectl create deployment hello-world-clusterip --namespace ns1 \
  --image=gcr.io/google-samples/hello-app:1.0
```

```bash
kubectl expose deployment hello-world-clusterip --namespace ns1 \
  --port=80 --target-port=8080 --type ClusterIP
```

Both last commands  ar being executed in the namespace, `ns1`, and so now we actually have two services with the exact same names: `hello‑world‑clusterip`, but, they're in different namespaces, which means they'll have also different DNS subdomains, let's run this DNS query against this new DNS record. 

```bash
nslookup hello-world-clusterip.ns1.svc.cluster.local 10.96.0.10
```

So we have `nslookup`, and there we see hello‑world‑clusterip, but this time, rather than default, we have our namespace, ns1.svc.cluster.local, and we're going to initiate that query against 10.96.0.10, which is our cluster DNS service, 

```
Server:         10.96.0.10
Address:        10.96.0.10#53

Name:   hello-world-clusterip.ns1.svc.cluster.local
Address: 10.101.212.234
```

and there we can see hello‑world.clusterip from ns1 gives us a different IP, which is now `10.101.212.234`. We can go ahead and compare that result with the other DNS record in a default zone:

```bash
nslookup hello-world-clusterip.default.svc.cluster.local 10.96.0.10
```

And you could see that's on a different IP address, so there we see `10.106.64.74`.

```
Server:         10.96.0.10
Address:        10.96.0.10#53

Name:   hello-world-clusterip.default.svc.cluster.local
Address: 10.106.64.74
```
