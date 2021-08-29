# ClusterIP

The first thing we're going to do is create a deployment imperatively at the command line. 

```bash
kubectl create deployment hello-world-clusterip \
  --image=gcr.io/google-samples/hello-app:1.0
```

The deployement gets created

```
deployment.apps/hello-world-clusterip created
```

The next step that we want to do to is expose that deployment as a service is use the kubectl expose command. 

```bash
kubectl expose deployment hello-world-clusterip \
  --port=80 --target-port=8080 --type ClusterIP
``` 

Let's go ahead and run that code and create that service. 

```
service/hello-world-clusterip exposed
```

If we didn't specify ‑‑type as a parameter to the kubectl expose command, the default type will be ClusterIP. If we do a kubectl get service, there we can see in the listing our ClusterIP service, and so let's walk through the output. 

```bash
kubectl get service
```

We see the name hello‑world‑clusterip and the type, which is ClusterIP. And then we see our ClusterIP address `10.101.39.58` and that will persist for the lifetime of this service. 

```
NAME                    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
hello-world-clusterip   ClusterIP   10.101.39.58   <none>        80/TCP    117s
kubernetes              ClusterIP   10.96.0.1      <none>        443/TCP   4d23h
```

Since it's a ClusterIP service, we have no external IP and there we see the Port 80/TCP. Let's go ahead and grab that SERVICEIP and store that in an environment variable for reuse. 

```bash
SERVICEIP=$(kubectl get service hello-world-clusterip -o jsonpath='{ .spec.clusterIP }')
echo $SERVICEIP
```

Let's go ahead and run that code and grab that IP as a parameter and we'll echo it out just to make sure that we have are correct value and there we can see our IP `10.101.39.58`. So to access our application, we'll use the curl command, so curl HTTP:// and then we'll use that environment variable for our service IP, and there we can see we can access our application with the appropriate output. 

```bash
curl http://$SERVICEIP
```
After running the command we get 

```
Hello, world!
Version: 1.0.0
Hostname: hello-world-clusterip-5f964c6ddf-5jbn9
```


Let's dig a little further into what's behind the scenes for this particular service and look at the endpoints that are available. 

```bash
kubectl get endpoints hello-world-clusterip
```

Running the previous command, we'll see that we have just one endpoint and that's the pod with the IP address of `192.168.158.6` running an application on the target port `8080`. 

```
NAME                    ENDPOINTS            AGE
hello-world-clusterip   192.168.158.6:8080   17m
```


If we do a kubectl get pods ‑o wide to look at our pod's Network configuration, 

```bash
kubectl get pods -o wide
```

we can see that this is the pod supporting the service with the IP address of `192.168.158.6`. 

```
NAME                                     READY   STATUS    RESTARTS   AGE   IP              NODE            NOMINATED NODE   READINESS GATES
hello-world-clusterip-5f964c6ddf-5jbn9   1/1     Running   0          24m   192.168.158.6   worker-node02   <none>           <none>
```

Now, if we ever have to access an application directly, if we needed to actually troubleshoot an individual pod that's up and running, well, we can look at those endpoints, and so let's go ahead and do that again, we'll do a kubectl get endpoints and we can see the listing of endpoints, and if we know a particular pod is causing us trouble, well inside of our cluster, we can grab that pod IP, then we can access our application directly for that exact pod using the pod IP when were inside of the cluster. So there I'm using curl against the individual pod IP on that container based applications target port, which is 8080. 

```bash
kubectl get endpoints hello-world-clusterip
PODIP=$(kubectl get endpoints hello-world-clusterip -o jsonpath='{ .subsets[].addresses[].ip }')
echo $PODIP
curl http://$PODIP:8080
```

```
Hello, world!
Version: 1.0.0
Hostname: hello-world-clusterip-5f964c6ddf-5jbn9
```

Let's go ahead and extend this a little bit. Let's use kubectl scale on our deployment to expand the number of replicas supporting our deployment. 

```bash
kubectl scale deployment hello-world-clusterip --replicas=6
```

The previous command returns

```
deployment.apps/hello-world-clusterip scaled
```

Now, if we look at our endpoints, we'll see in the listing all of the endpoints behind the service. 

```bash
kubectl get endpoints hello-world-clusterip
```

In that list there we can see our `192.168.158.6:8080` pod that we started with and some additional pods have been added to that list. 

```
NAME                    ENDPOINTS                                                              AGE
hello-world-clusterip   192.168.158.6:8080,192.168.158.7:8080,192.168.158.8:8080 + 3 more...   31m
```

If we hit our service, our request will be load balanced across the pods supporting the service that are registers endpoints. And so there we can see the different pod names as I hit that service over and over again. 

```bash
curl http://$SERVICEIP
```

```
Hello, world!
Version: 1.0.0
Hostname: hello-world-clusterip-5f964c6ddf-hcvwm
```

```
Hello, world!
Version: 1.0.0
Hostname: hello-world-clusterip-5f964c6ddf-ljtdx
```


Let's go ahead and describe the service. 

```bash
kubectl describe service hello-world-clusterip
```

Inside of here, let's go ahead and walk through this core information. 

```
Name:              hello-world-clusterip
Namespace:         default
Labels:            app=hello-world-clusterip
Annotations:       <none>
Selector:          app=hello-world-clusterip
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.101.39.58
IPs:               10.101.39.58
Port:              <unset>  80/TCP
TargetPort:        8080/TCP
Endpoints:         192.168.158.6:8080,192.168.158.7:8080,192.168.158.8:8080 + 3 more...
Session Affinity:  None
Events:            <none>
```

So kubectl describe gives us that deep dive information about an object, so here we see the name and the namespace, and now the labels here are the labels for this individual resource, in this case, it's the service. The selector, which is `app=hello‑world‑clusterip` is what's going to determine which pods are a member of this service. There we see the type, clusterip, we have our IP address, and then the port that our service is running on, and then I receive target port, which is where our application is running, and also, a listing of endpoints, so a very good command to get kind of a view of the whole state of our service. 

Now that selector I want to call out again is `app=hello‑world‑clusterip`. 

```bash
kubectl get pods --show-labels
```

We can see that that label is associated with the pods that are up and running supporting this service that's there on the right, we see `app=hello‑world‑clusterip`. 

```
hello-world-clusterip-5f964c6ddf-5jbn9   1/1     Running   0          44m     app=hello-world-clusterip,pod-template-hash=5f964c6ddf
hello-world-clusterip-5f964c6ddf-64vvq   1/1     Running   0          9m25s   app=hello-world-clusterip,pod-template-hash=5f964c6ddf
hello-world-clusterip-5f964c6ddf-gbhd2   1/1     Running   0          9m25s   app=hello-world-clusterip,pod-template-hash=5f964c6ddf
hello-world-clusterip-5f964c6ddf-hcvwm   1/1     Running   0          9m25s   app=hello-world-clusterip,pod-template-hash=5f964c6ddf
hello-world-clusterip-5f964c6ddf-hsr4v   1/1     Running   0          9m25s   app=hello-world-clusterip,pod-template-hash=5f964c6ddf
hello-world-clusterip-5f964c6ddf-ljtdx   1/1     Running   0          9m25s   app=hello-world-clusterip,pod-template-hash=5f964c6ddf
```

So let's go ahead and delete this deployment and the service and clean up this part.

```bash
kubectl delete deployments hello-world-clusterip
kubectl delete service hello-world-clusterip 
```