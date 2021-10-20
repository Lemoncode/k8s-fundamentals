# StatefulSet

## Steps

### 1. Create the StatefulSet

Create `random-employee.statefulset.yaml`

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: remp # 1
spec:
  serviceName: random-employee # 2
  replicas: 2 # 3
  selector:
    matchLabels:
      app: random-employee
  template:
    metadata:
      labels:
        app: random-employee
    spec:
      containers:
        - name: random-employee
          image: jaimesalas/random-employee:0.0.1
          ports:
            - containerPort: 3000
              name: http
          volumeMounts:
            - mountPath: /opt/app/logs
              name: logs
  volumeClaimTemplates: # 4
    - metadata:
        name: logs
      spec:
        accessModes:
          - "ReadWriteOnce"
        resources:
          requests:
            storage: 10Mi
```


1. Name of the StatefulSet is used as prefix
2. References the mandatory Service
3. Two Pod members in the StatefulSret named remp-0 and remp-1
4. Template for creating a PVC for each POd


```bash
kubectl apply -f random-employee.statefulset.yaml
```

Let's have a look into our new `Stateful`, if we run:

```bash
kubectl describe statefulset remp
```

We get something similar to this:

```
Name:               remp
Namespace:          default
CreationTimestamp:  Mon, 18 Oct 2021 15:47:31 +0200
Selector:           app=random-employee
Labels:             <none>
Annotations:        <none>
Replicas:           2 desired | 2 total
Update Strategy:    RollingUpdate
  Partition:        0
Pods Status:        2 Running / 0 Waiting / 0 Succeeded / 0 Failed
Pod Template:
  Labels:  app=random-employee
  Containers:
   random-employee:
    Image:        jaimesalas/random-employee:0.0.1
    Port:         3000/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:
      /opt/app/logs from logs (rw)
  Volumes:  <none>
Volume Claims:
  Name:          logs
  StorageClass:  
  Labels:        <none>
  Annotations:   <none>
  Capacity:      10Mi
  Access Modes:  [ReadWriteOnce]
Events:
  Type    Reason            Age   From                    Message
  ----    ------            ----  ----                    -------
  Normal  SuccessfulCreate  58s   statefulset-controller  create Claim logs-remp-0 Pod remp-0 in StatefulSet remp success
  Normal  SuccessfulCreate  58s   statefulset-controller  create Pod remp-0 in StatefulSet remp successful
  Normal  SuccessfulCreate  40s   statefulset-controller  create Claim logs-remp-1 Pod remp-1 in StatefulSet remp success
  Normal  SuccessfulCreate  40s   statefulset-controller  create Pod remp-1 in StatefulSet remp successful
```

And if we have a look into the PVCs

```bash
kubectl get pvc
```
We get something similar to this:

```
NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
logs-remp-0   Bound    pvc-903655d1-9b0f-4c65-82f4-973ad3c4b4b7   10Mi       RWO            standard       93s
logs-remp-1   Bound    pvc-23e22e6b-35eb-4806-a24e-469bb79c3d56   10Mi       RWO            standard       75s
```

To create PVCs the same way it creates Pods, StatefulSet uses a `volumeClaimTemplates` element. This extra property is one of the main differences between a StatefulSet and a ReplicaSet, which has a `persistentVolumeClaim` element.

StatefulSets create PVCs by using `volumeClaimTemplates` on the fly during Pod creation. This mechanism allows every Pod to get its own dedicated PVC during initial creation as well as during scaling up by changing the replicas count of the StatefulSets.

But what about PV's? StatefulSets do not manage PVs in any way. The storage for the Pods must be provisioned in advance by an admin, or provisioned on-demand by a PV provisioner based on the requested storage class and ready for consumption by the stateful Pods.

> EXERCISE: Why is this working, if we didn't create any PV on advance?

### 2. Create a service to reach the SatefulSet

Create `random-employee.service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: random-employee
spec:
  clusterIP: None # 1.
  selector:
    app: random-employee
  ports:
    - port: 3000
      name: http

```

1. Declares the Service as headless

This Service creates Endpoint records in the API Server, and creates DNS entries to return A records (addresses) that point directly to the Pods backing the Service.

> Each Pod gets a DNS entry where clients can directly reach out to it in a predictable way. 

```bash
kubectl apply -f random-employee.service.yaml
```

Let's try to reach the service:

```bash
kubectl run -it --rm --restart=Never busybox --image=gcr.io/google-containers/busybox sh
```

From inside `busybox`

```bash
wget random-employee:3000/employees/random/
```

```bash
wget remp-0.random-employee.default.svc.cluster.local:3000/employees/random/
```

```bash
wget remp-1.random-employee.default.svc.cluster.local:3000/employees/random/
```

Now we can inspect the logs from inside the running container

```bash
 kubectl exec -it remp-0 -- sh
/opt/app # ls
app.js                         helpers.js                     node_modules                   routes.js
config.js                      logger.js                      package-lock.json              service-ready
employee-generator.service.js  logs                           package.json
/opt/app # ls logs
log
/opt/app # cat logs/log 
Hostrandom-employee:3000User-AgentWgetConnectionclose
Hostremp-0.random-employee.default.svc.cluster.local:3000User-AgentWgetConnectionclose
```

## Clean up

```bash
kubectl delete -f ./
```