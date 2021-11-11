# Customize CoreDNS Configuration

What we're going to do here is configure CoreDNS to use custom forwarders, and we're going to use two different types. We're going forward to a specific upstream forwarder, and we're also going to configure what's called a conditional domain forwarder. Let's have a look at the YAML file `CoreDNSConfigCustom.yaml`. 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . 1.1.1.1
        cache 30
        loop
        reload
        loadbalance
    }
    google.com {
        forward . 8.8.8.8
    }

```

Now inside the YAML file, we'll see the definition for our `ConfigMap`, so there, we see `apiVersion: V1`, `kind: ConfigMap`, and the **name is coredns**. And inside of the data section, there, we see `Corefile`. `Corefile` is **the file that's going to be exposed as a mount inside of the pod at etc CoreDNS**. We see the start of a server block. Inside of that server block is the core configuration for our CoreDNS server.

```
.:53 {
        errors
        health
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . 1.1.1.1
        cache 30
        loop
        reload
        loadbalance
    }
    google.com {
        forward . 8.8.8.8
    }
```

Going down, we can see, a forwarder definition. For all DNS domains that aren't hosted locally on this DNS server, those requests should be forwarded on to `1.1.1.1`. [Here](https://1.1.1.1/dns/) we can find a reference to it.

```
# .....
prometheus :9153
forward . 1.1.1.1
cache 30
loop
# .....
```

Going down, is added what's called a conditional forwarder, and so we have an additional server block to help us with that. 

```
google.com {
    forward . 8.8.8.8
} 
```

We see `google.com`, for any requests of that domain, those DNS requests will be forwarded to the forwarder 8.8.8.8. Let's go ahead and run, kubectl apply -f CoreDNSConfigCustom.yaml in the namespace kube-system.

```bash
kubectl apply -f CoreDNSConfigCustom.yml -n kube-system
```

At the bottom, we can see configmap/coredns configured. 

```
Warning: resource configmaps/coredns is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
configmap/coredns configured
```

Now that's going to update the `ConfigMap`. What that doesn't do is update the configuration file in the pod. It takes a second before that volume based ConfigMap exposes a file to refresh that file. Let's see a technique on how you can figure out when your DNS configuration gets refreshed. We can use:

```bash
kubectl logs -f deployment/coredns --all-containers=true -n kube-system
```

That's going to do is follow the application logs in both of the pods that are up and running. After a minute or two, what we'll do is we'll get a log entry in this file showing that the configuration has been reloaded, meaning that the file inside of the pod has been updated. 

```
Found 2 pods, using pod/coredns-558bd4d5db-5w44v
.:53
[INFO] plugin/reload: Running configuration MD5 = db32ca3650231d74073ff4cf814959a7
CoreDNS-1.8.0
linux/amd64, go1.15.3, 054c9ae
[INFO] Reloading
[INFO] plugin/health: Going into lameduck mode for 5s
[INFO] plugin/reload: Running configuration MD5 = 75a06cca1d78a2c401688274eec9cb0a
[INFO] Reloading complete
```

`CoreDNS` sends that update and reloaded the DNS server. And there, at the bottom, we can see log entries for each pod now that its configuration has been updated, and we see that reloading is complete. 

```
[INFO] plugin/reload: Running configuration MD5 = 75a06cca1d78a2c401688274eec9cb0a
[INFO] Reloading complete
```

Now that we made a configuration change, the next thing that we want to do is to make sure that our DNS service still works. Now, if we did something wrong in our configuration, we would have saw in our kubectl logs that we were just looking at, but we want to make sure that we still have DNS resolution. Let's go ahead and grab our SERVICEIP for our kube‑dns service and use nslookup to do some domain queries. Inside the `master` run:

```bash
SERVICEIP=$(kubectl get service -n kube-system kube-dns -o jsonpath='{ .spec.clusterIP }')
```

Let's go ahead and do a query for `www.lemoncode.net` on the specific SERVICEIP. 

```bash
nslookup www.lemoncode.net $SERVICEIP
```

There, we can see the address that we're requesting against is `10.96.0.10`, and we got some DNS information back. 

```
Server:         10.96.0.10
Address:        10.96.0.10#53

Non-authoritative answer:
www.lemoncode.net       canonical name = ext-cust.squarespace.com.
Name:   ext-cust.squarespace.com
Address: 198.49.23.145
Name:   ext-cust.squarespace.com
Address: 198.185.159.144
Name:   ext-cust.squarespace.com
Address: 198.185.159.145
Name:   ext-cust.squarespace.com
Address: 198.49.23.144
```

So we know our DNS configuration is up and running. The next thing that we're going to do before we move along into the next portion of the demo is to put our DNS configuration back. 

```bash
kubectl apply -f CoreDNSConfigDefault.yml -n kube-system
```

And so that still will follow that same process. It'll take a minute for the configmap to update the file that's exposed into the pod, and then we'll see our DNS configuration restart as it senses that there was a new file updated inside of the pod. 

What we're going to do is **configuring a pod's DNS client information**, and so let's look at `DeploymentCustomDns.yml`. 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world-customdns
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-world-customdns
  template:
    metadata:
      labels:
        app: hello-world-customdns
    spec:
      containers:
      - name: hello-world
        image: gcr.io/google-samples/hello-app:1.0
        ports:
        - containerPort: 8080
      dnsPolicy: "None"
      dnsConfig:
        nameservers:
          - 8.8.8.8
---
apiVersion: v1
kind: Service
metadata:
  name: hello-world-customdns
spec:
  selector:
    app: hello-world-customdns
  ports:
  - port: 80
    protocol: TCP
    targetPort: 8080

```

Inside of here, we have a basic deployment that starts up a couple replicas. So we're going to drill down into the pod templates spec, and inside of there, you can see we have a `dnsPolicy` defined. The `dnsPolicy` is set the None. inside of that, we have, a `dnsConfig` where we're defining a specific nameserver, in this case, `8.8.8.8`. Let's apply `DeploymentCustomDns.yml`. 

```bash
kubectl apply -f DeploymentCustomDns.yml
```

We can see our deployment has been created, and so I want to verify that that actually has taken effect inside of a pod. 

```
deployment.apps/hello-world-customdns created
service/hello-world-customdns created
```

And what we'll do is we'll grab one of the PODNAMEs using kubectl get pods with that selector query there, throw that in an environment variable. 

```bash
PODNAME=$(kubectl get pods --selector=app=hello-world-customdns -o jsonpath='{ .items[0].metadata.name }')
```

Let's double check to make sure that we have one, so we'll do echo $PODNAME, and there we can see one of the pods that we have. 

```bash
echo $PODNAME
```

To verify the DNS configuration,let's read the configuration of `etc/resolv.conf` inside of the pod, and we can do that with `kubectl exec ‑it`, passing in the environment variable for the PODNAME, ‑‑cat, which is the program that we want to execute, and giving it the parameter `etc/resolv.conf`, and what we're going to get is the contents of that file written to standard out. 

```bash
kubectl exec -it $PODNAME -- cat /etc/resolv.conf
```

And there, we can see nameserver inside of the pod is set to 8.8.8.8, overriding the default configuration, which is cluster first. 

```
nameserver 8.8.8.8
```

Let's go ahead and clean up from this demonstration 

```bash
kubectl delete -f DeploymentCustomDns.yml
```

``` 
deployment.apps "hello-world-customdns" deleted
service "hello-world-customdns" deleted
```