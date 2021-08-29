# Service Discovery - Environment Variables

> NOTE: Start from previous demo with the same setup

Let's get into the environment variable. We have a deployment that's up and running, so let's go ahead and grab a pod name from that deployment and make sure we have a pod name, we'll echo that out to the console, and there we can see the pod name. 

```bash
PODNAME=$(kubectl get pods -o jsonpath='{ .items[].metadata.name }')
echo $PODNAME
kubectl exec -it $PODNAME -- env | sort
```

So let's use kubectl exec ‑it against that pod name and execute the command env and then pipe its output to sort and that's going to list all of the defined environment variables in the shell and then sort that output for us so that we can read it easily. 

```
HOME=/root
HOSTNAME=hello-world-clusterip-5f964c6ddf-p48r4
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
KUBERNETES_PORT_443_TCP_PORT=443
KUBERNETES_PORT_443_TCP_PROTO=tcp
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PORT=8080
TERM=xterm
```

We can see we have a collection of environment variables. We have several environment variables that are going to be defined just as part of the base OS, but the services, those ones there that start with kubernetes, are the ones that were defined for us by kubernetes when it started at the pod and the only service that was available at the time this pod started up was the actual Kubernetes service. And so there we could see all the different variations of the environment variables that are created to represent that services configuration, but you might be wondering, where is the hello‑world service? 

We created that service, right? We did, but we created the deployment first, which deployed the pod, and then we created the service second, which then created the service. And so, the time that that pod started up, that service didn't exist yet so it's not here inside this collection of environment variables because they're only defined at pod startup. 

We can get around that by deleting this pod and letting it recreate, and so let's go and do that now. We'll do a kubectl delete pod against that pod name. 

```bash
kubectl delete pod $PODNAME
```

That pod will be immediately re created by the deployments replica set controller. And now, let's go ahead and run that same command again. 

```bash
PODNAME=$(kubectl get pods -o jsonpath='{ .items[].metadata.name }')
echo $PODNAME
kubectl exec -it $PODNAME -- env | sort
```

We get:

```
HELLO_WORLD_CLUSTERIP_PORT=tcp://10.106.64.74:80
HELLO_WORLD_CLUSTERIP_PORT_80_TCP=tcp://10.106.64.74:80
HELLO_WORLD_CLUSTERIP_PORT_80_TCP_ADDR=10.106.64.74
HELLO_WORLD_CLUSTERIP_PORT_80_TCP_PORT=80
HELLO_WORLD_CLUSTERIP_PORT_80_TCP_PROTO=tcp
HELLO_WORLD_CLUSTERIP_SERVICE_HOST=10.106.64.74
HELLO_WORLD_CLUSTERIP_SERVICE_PORT=80
HOME=/root
HOSTNAME=hello-world-clusterip-5f964c6ddf-5lm57
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
KUBERNETES_PORT_443_TCP_PORT=443
KUBERNETES_PORT_443_TCP_PROTO=tcp
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PORT=8080
TERM=xterm
```

We can see our HELLO‑WORLD‑CLUSTERIP SERVICE has a collection of environment variables available, and this is one of the key reasons why you prefer DNS over environment variables because DNS information is more easily updated without having to terminate and start new pods. 

Let's go ahead and look at an external name service. Create `service-externalname.yaml`

```yml
apiVersion: v1
kind: Service
metadata:
  name: hello-world-api
spec:
  type: ExternalName
  externalName: hello-world.api.example.com

```

Inside this YAML file here, we've defined an external name service. Walking through this configuration here, we have our API version v1, our kind is service, our metadata is the name of the object that we're going to create, and so, that's going to be hello‑world‑api. Inside of the spec, we're going to define the type of service, and that's going to be `ExternalName`. Now the only element that we have to define is the external name parameter, so here we have `hello‑world‑api.example.com`. We're going to create a service named hello‑world‑api and that's going to be a cluster service, but it's going to have a cname record that points to this DNS name here that we're defining on `externalName: hello-world.api.example.com`. 

Run this code. Open a new terminal `cd` into `05-service-discovery-env-vars` and run it from `host`.

```bash
kubectl apply -f service-externalname.yaml
```

There we see service hello‑world‑api is created. 

```
service/hello-world-api created
```

If we run a DNS query against `hello‑world‑api.default.svc.cluster.local` against our cluster DNS server, 

```bash
nslookup hello-world-api.default.svc.cluster.local 10.96.0.10
```

what we'll get is the cname record pointing to that external name: 

```
Server:         10.96.0.10
Address:        10.96.0.10#53

hello-world-api.default.svc.cluster.local       canonical name = hello-world.api.example.com.
** server can't find hello-world.api.example.com: NXDOMAIN
```


So from our cluster DNS Server at `10.96.0.10`, we asked for the DNS record, `hello‑world‑api.default.svc.cluster.local`, and the return, the data that we got back from that query is a cname or a canonical name, which is `hello‑world‑api.example.com`. Whenever we ask for `hello‑world‑api.default.svc.cluster.local`, we will get `hello‑world‑api.example.com` in the return. 

Let's clean

```bash
kubectl delete service hello-world-api
kubectl delete service hello-world-clusterip
kubectl delete service hello-world-clusterip --namespace ns1
```