# Rolling Back Deployments Demo

Check the status of the previous deployment, from root folder:

```bash
kubectl rollout status -f nginx.deployment.yml
```

```
deployment "my-nginx" successfully rolled out
```

Because we used `--record` we can see now the history

```bash
kubectl rollout history deployment my-nginx 
```

```
deployment.apps/my-nginx 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=./ --save-config=true --record=true
2         kubectl apply --filename=nginx.deployment.yml --record=true
```

If we want to get information of the second one, we can do it by:

```bash
kubectl rollout history deployment my-nginx --revision=2
```

```
deployment.apps/my-nginx with revision #2
Pod Template:
  Labels:       app=my-nginx
        pod-template-hash=6b49b568f5
  Annotations:  kubernetes.io/change-cause: kubectl apply --filename=nginx.deployment.yml --record=true
  Containers:
   my-nginx:
    Image:      nginx:1.16.1-alpine
    Port:       80/TCP
    Host Port:  0/TCP
    Limits:
      cpu:      200m
      memory:   128Mi
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>
```

Now if we want to rollback to the previous one, we can make that easily by

```bash
kubectl rollout undo deployment my-nginx --to-revision=1
```

```
deployment.apps/my-nginx rolled back
```

Now we can have a look into the `history` again

```bash
kubectl rollout history deployment my-nginx
```

```
deployment.apps/my-nginx 
REVISION  CHANGE-CAUSE
2         kubectl apply --filename=nginx.deployment.yml --record=true
3         kubectl create --filename=./ --save-config=true --record=true
```

Let's check that we have change the nginx version

```bash
kubectl describe deployment my-nginx
```

```
Name:                   my-nginx
Namespace:              default
CreationTimestamp:      Sat, 15 Aug 2020 19:05:22 +0200
Labels:                 app=my-nginx
Annotations:            deployment.kubernetes.io/revision: 3
                        kubernetes.io/change-cause: kubectl create --filename=./ --save-config=true --record=true
Selector:               app=my-nginx
Replicas:               4 desired | 4 updated | 4 total | 4 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        1
RollingUpdateStrategy:  1 max unavailable, 1 max surge
Pod Template:
  Labels:  app=my-nginx
  Containers:
   my-nginx:
    Image:      nginx:1.17.8-alpine
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
NewReplicaSet:   my-nginx-7766947787 (4/4 replicas created)
Events:
  Type    Reason             Age                    From                   Message
  ----    ------             ----                   ----                   -------
  Normal  ScalingReplicaSet  13m                    deployment-controller  Scaled up replica set my-nginx-7766947787 to 4
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled up replica set my-nginx-6b49b568f5 to 1
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled down replica set my-nginx-7766947787 to 3
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled up replica set my-nginx-6b49b568f5 to 2
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled down replica set my-nginx-7766947787 to 2
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled up replica set my-nginx-6b49b568f5 to 3
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled down replica set my-nginx-7766947787 to 1
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled up replica set my-nginx-6b49b568f5 to 4
  Normal  ScalingReplicaSet  12m                    deployment-controller  Scaled down replica set my-nginx-7766947787 to 0
  Normal  ScalingReplicaSet  2m50s (x8 over 2m58s)  deployment-controller  (combined from similar events): Scaled down replica set my-nginx-6b49b568f5 to 0
```

We can check that the image is different to the previous one `Image: nginx:1.17.8-alpine`

### Cleanup

`cd` into 02-rolling-update/01-rolling-update-demo

```bash
kubectl delete -f ./
```
