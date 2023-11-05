# Load Balancer

## Start a new cluster on EKS

```bash
eksctl create cluster \
--name lc-cluster \
--version 1.21 \
--region eu-west-3 \
--nodegroup-name lc-nodes \
--node-type t2.small \
--nodes 2 \
--managed
```

Once is up and ready ensure that kubectl is pointing to the new cluster

```bash
kubectl config get-contexts
```

The expected output

```
CURRENT   NAME                                           CLUSTER                          AUTHINFO                                       NAMESPACE
*         Administartor@lc-cluster.eu-west-3.eksctl.io   lc-cluster.eu-west-3.eksctl.io   Administartor@lc-cluster.eu-west-3.eksctl.io   
          kubernetes-admin@kubernetes                    kubernetes                       kubernetes-admin
```

You can change context to point `EKS` by running:

```bash
kubectl config use-context Administartor@lc-cluster.eu-west-3.eksctl.io
```

We want to be able to consume the load balancer service and work with an actual cloud load balancer, and we don't have that capability in our on‑prem cluster. 

We're going to create a deployment, and this time we're going to call it hello‑world‑loadbalancer. 

```bash
kubectl create deployment hello-world-loadbalancer \
  --image=gcr.io/google-samples/hello-app:1.0
```

```
deployment.apps/hello-world-loadbalancer created
```

Now we're going to expose our deployment as a service. This time we're going to specify the type as LoadBalancer. 

```bash
kubectl expose deployment hello-world-loadbalancer \
  --port=80 --target-port=8080 --type LoadBalancer 
```

Run the code to create our load balancer service, which will then work with our cloud provider to provision a cloud load balancer in a real public IP.

```
service/hello-world-loadbalancer exposed
```

If we do a kubectl get service now, 

```bash
kubectl get service
```

we can see I have a service that's up and running. 

```
NAME                       TYPE           CLUSTER-IP     EXTERNAL-IP                                                              PORT(S)        AGE
hello-world-loadbalancer   LoadBalancer   10.100.68.77   a8aefb5c799c64884ba1dce274413e5f-957030085.eu-west-3.elb.amazonaws.com   80:32256/TCP   61s
kubernetes                 ClusterIP      10.100.0.1     <none>                                                                   443/TCP        61m
```


Let's walk through this output. We see `hello‑world‑loadbalancer`, that's the name, the type of the service is loadbalancer. This service too will have a `ClusterIP`, there we see it's `10.100.68.77`. Our EXTERNAL‑IP is currently pending, and so what's happening behind the scenes is AWS is provisioning that real load balancer and a public IP for that. Once that is finished, then that information will be reported back to the service and it will become available to us. We also see our ClusterIP port, which is `80`, and our NodePort service, which is `32256`. 

Let's go ahead and check the service again to see if we have our public IP. If still pending, do this, add a watch. 

```bash
kubectl get service --watch
```

We can see we have our public IP address provisioned, `a8aefb5c799c64884ba1dce274413e5f-957030085.eu-west-3.elb.amazonaws.com`. 

We'll grab that public IP and store that in an environment variable, and then we'll try to access our service on that real public IP address. And so I'll use the curl command to do that on the services port, which is port 80. 

```bash
LOADBALANCER=$(kubectl get service hello-world-loadbalancer -o jsonpath='{ .status.loadBalancer.ingress[].hostname }')
curl http://$LOADBALANCER
```

Go ahead and run that code there, and there we can see the output from our application. 

```
Hello, world!
Version: 1.0.0
Hostname: hello-world-loadbalancer-86d5cd9c78-dd4r9
```

Let's go ahead and do a kubectl get service hello-world-loadbalancer and look at that information one more time. 

```bash
kubectl get service hello-world-loadbalancer
```

So there we see, our EXTERNAL‑IP is populated in our services information. And to recap what's going on here, when we access that EXTERNAL‑IP on that cloud load balancer, that cloud load balancer is going to send its traffic to the NodePort service. The NodePort service is then going to send a traffic on to the ClusterIP service, which will then route it to an individual pod that services our deployment. So let's go ahead and clean up.

```bash
kubectl delete deployment hello-world-loadbalancer
kubectl delete service hello-world-loadbalancer
```