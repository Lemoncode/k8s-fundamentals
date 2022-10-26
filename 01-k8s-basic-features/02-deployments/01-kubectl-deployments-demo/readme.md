## kubectl deployments demo

### Pre requisites

A running Kubernetes cluster and kubectl properly configured pointing to the cluster.

### Steps

Create `./nginx.deployment.yml`

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  labels:
    app: my-nginx
spec:
  selector: # 1
    matchLabels:
      app: my-nginx
  template:
    metadata:
      labels:
        app: my-nginx # 2
    spec:
      containers:
      - name: my-nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources: # 3
          limits:
            memory: "128Mi" #128 MB
            cpu: "200m" #200 millicpu (.2 cpu or 20% of the cpu)
      
```

1. Notice that this _selector_ is matching labels __app: my-nginx__
2. This will __tie__ the _deployment_ to this _template_ 
3. With this contraints what a particular container can consume.

Now we can run this as:

```bash
kubectl create -f nginx.deployment.yml --save-config
```

```
deployment.apps/my-nginx created
```

And if we get a look of the state now, we will find out

```bash
kubectl get all
```

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-nginx-5fb9556b5c-t8qf4   1/1     Running   0          37s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   9d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-nginx   1/1     1            1           37s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-nginx-5fb9556b5c   1         1         1       37s
```

Notice _my-nginx-5fb9556b5c_, with this value we can associate the _deployment_ with the replica set, and with this other value _my-nginx-5fb9556b5c-t8qf4_, we can associate the container to the replica set.

If we describe the `ReplicaSet` we will find out, that is controlled by the `Deployment`:

```bash
kubectl describe rs my-nginx
```

```
Name:           my-nginx-5bb9b897c8
Namespace:      default
Selector:       app=my-nginx,pod-template-hash=5bb9b897c8
Labels:         app=my-nginx
                pod-template-hash=5bb9b897c8
Annotations:    deployment.kubernetes.io/desired-replicas: 4
                deployment.kubernetes.io/max-replicas: 5
                deployment.kubernetes.io/revision: 1
Controlled By:  Deployment/my-nginx
```

Now we can go ahead and describe the deployment:

```bash
kubectl describe deployment my-nginx
```

```
Name:                   my-nginx
Namespace:              default
CreationTimestamp:      Mon, 27 Apr 2020 18:34:05 +0200
Labels:                 app=my-nginx
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=my-nginx
Replicas:               1 desired | 1 updated | 1 total | 1 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=my-nginx
  Containers:
   my-nginx:
    Image:      nginx:alpine
    Port:       80/TCP
    Host Port:  0/TCP
    Limits:
      cpu:        200m
      memory:     128Mi
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   my-nginx-5fb9556b5c (1/1 replicas created)
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  5m33s  deployment-controller  Scaled up replica set my-nginx-5fb9556b5c to 1
```

We can get our deployments by

```bash
kubectl get deploy
```

```
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   1/1     1            1           7m23s
```

```bash
kubectl get deployment
```

```
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   1/1     1            1           7m27s
```

We can get the labels as well

```bash
kubectl get deployments --show-labels
```

```
NAME       READY   UP-TO-DATE   AVAILABLE   AGE   LABELS
my-nginx   1/1     1            1           11m   app=my-nginx
```

We can also filter by labels

```bash
kubectl get deployments -l app=my-nginx
```

```
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-nginx   1/1     1            1           13m
```

Now we can scale up the deployment by doing


```bash
kubectl scale -f nginx.deployment.yml --replicas=4
```

```
deployment.apps/my-nginx scaled
```

```bash
kubectl get all
```

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-nginx-5fb9556b5c-p7smw   1/1     Running   0          47s
pod/my-nginx-5fb9556b5c-t8qf4   1/1     Running   0          17m
pod/my-nginx-5fb9556b5c-v6jjj   1/1     Running   0          47s
pod/my-nginx-5fb9556b5c-x2ccq   1/1     Running   0          47s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   9d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-nginx   4/4     4            4           17m

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-nginx-5fb9556b5c   4         4         4       17m
```

Now we can delete this deployment 

```bash
kubectl delete -f nginx.deployment.yml
```

```
deployment.apps "my-nginx" deleted
```

Another way to do this is from _yaml_

* Modify __02_creating_deployments/nginx.deployment.yml__

```diff
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  labels:
    app: my-nginx
spec:
+ replicas: 4
  selector:
....
```

```bash
kubectl apply -f nginx.deployment.yml 
```

```
deployment.apps/my-nginx created
```

```bash
kubectl get all
```

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-nginx-5fb9556b5c-dqpvw   1/1     Running   0          30s
pod/my-nginx-5fb9556b5c-h5bq8   1/1     Running   0          30s
pod/my-nginx-5fb9556b5c-ht4wb   1/1     Running   0          30s
pod/my-nginx-5fb9556b5c-x9z4s   1/1     Running   0          30s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   9d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-nginx   4/4     4            4           30s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-nginx-5fb9556b5c   4         4         4       30s
```

* __kubectl__ Deployments Commands

Several different kubectl commands can be used to create and work with Deployments

```
kubectl create -f nginx.deployment.yml --save-config
kubectl describe [pod | deployment] [pod-name | deployment-name]
kubectl apply -f nginx.deployment.yml
kubectl get deployments --show-labels
kubectl get deployments -l app=my-nginx
kubectl scale -f nginx.deployment.yml --replicas=4
```

### Cleanup

```bash
kubectl delete -f ./
```
