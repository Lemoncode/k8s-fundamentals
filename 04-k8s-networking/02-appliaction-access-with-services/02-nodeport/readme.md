# Nodeport

Now we're going to work with some `NodePort` Services, creating them and accessing them. Let's start off with creating the deployment again, which will start up our hello‑world‑nodeport deployment. 

```bash
kubectl create deployment hello-world-nodeport \
  --image=gcr.io/google-samples/hello-app:1.0
```


We're going to expose the deployment, but this time we're going to change the type to NodePort. 

```bash
kubectl expose deployment hello-world-nodeport \
  --port=80 --target-port=8080 --type NodePort
```

Let's go ahead and run that code there. 

``` 
service/hello-world-nodeport exposed
```

Now let's use kubectl get service to get the information about that service that was created. 

```bash
kubectl get service
```

So in our output here, we can see the name is hello‑world‑nodeport, and the type is NodePort. We still have a cluster IP, and so in this case, it's going to be `10.107.6.138`. Now **we have no external IP**, and we can see the ports. We have a little bit of a different representation than what we've been used to when we've been looking at cluster IP services. We have two ports in here separated by a colon. The port on the left is associated with the cluster IP service for this particular service. Now recall our NodePort Service is actually back ended by a cluster IP service. And so as traffic comes in on the NodePort ports, it'll get routed to that cluster IP service. The port to the right of the colon, `30175`, that's our NodePort port, and so that's where we'll send traffic to external to the cluster to access our NodePort Service. 

```bash
NAME                   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
hello-world-nodeport   NodePort    10.107.6.138   <none>        80:31075/TCP   3m23s
kubernetes             ClusterIP   10.96.0.1      <none>        443/TCP        5d
```

We're going to grab the cluster IP. We're going to grab the cluster IP services port, and we're also going to grab that NodePort port and store those all as environment variables. Change to `master` terminal if you are running these commands from out of master node.

```bash
CLUSTERIP=$(kubectl get service hello-world-nodeport -o jsonpath='{ .spec.clusterIP }')
PORT=$(kubectl get service hello-world-nodeport -o jsonpath='{ .spec.ports[].port }')
NODEPORT=$(kubectl get service hello-world-nodeport -o jsonpath='{ .spec.ports[].nodePort }')
```

Now I want to call out that for this particular deployment, there's only one Pod that's up and running supporting our applications. 

```bash
kubectl get pods -o wide
```

There we can see hello‑world‑nodeport. 

```
NAME                                    READY   STATUS    RESTARTS   AGE   IP              NODE            NOMINATED NODE   READINESS GATES
hello-world-nodeport-6764cfbd49-wfhft   1/1     Running   0          15m   192.168.158.9   worker-node02   <none>           <none> 
```

Now that one Pod is running on node worker‑node02. We can hit any node in the cluster, and it's the responsibility of the `kube-proxy` to route that request to the node that has an actual Pod. And so let's go ahead and do that here. 

```bash
curl http://master-node:$NODEPORT
curl http://worker-node01:$NODEPORT
curl http://worker-node02:$NODEPORT
```


If I access the NodePort service on `master`, I get to our Pod. If I access it on `worker-node01` using the NodePort port, I get back to that same Pod. Regardless of which node I try to access the NodePort Service on, it's the responsibility of that node's `kube-proxy` to route the traffic to the cluster IP service, which will then send that traffic across the Pod network to whatever node is actually hosting the Pod at that point in time. 

Recall that we still have a cluster IP service behind our NodePort Service, and that's what's actually servicing the requests coming from the NodePort Service. If we do an echo just to look at our information there, we can see the cluster IP. 

```bash
echo $CLUSTERIP:$PORT
```

And if I try to access it, I'm accessing that same exact Pod. 

```bash
curl http://$CLUSTERIP:$PORT
```

Let's  delete this information and clean that up.

```bash
kubectl delete service hello-world-nodeport
kubectl delete deployment hello-world-nodeport
```

