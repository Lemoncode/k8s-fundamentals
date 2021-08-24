# Static Provisioning Demo

> TODO: Create EKS version

[Persistent Volumes Minikube](https://minikube.sigs.k8s.io/docs/handbook/persistent_volumes/)


Clean data from all volumes

```bash
$ minikube ssh
$ cd /data # or directory where volume lives
$ sudo rm -rf <volume-directory>
```

Create `ps-pv.yml`

```yml
apiVersion: v1
kind: PersistentVolume # 1
metadata:
  name: ps-pv # 2
spec:
  accessModes: # 3
    - ReadWriteOnce
  storageClassName: ps-fast
  capacity:
    storage: 10Mi
  persistentVolumeReclaimPolicy: Retain # 5
  hostPath: # 4
    path: /data/ps-vol
```

1. The PV is defined as top level objects in the `apiVersion: v1`. We're telling K8s how to define a PV.

2. We're giving a name

3. There's three access modes. 
    
    1. This one is `ReadWriteOnce`, which means this PV can be claimed once in read write mode by one pod. So if you try and use it in a second or third pod, you won't be allowed. 
    
    2. There's also `ReadWriteMany`, and that's the same, only you can use it lots of times. 
    
    3. There's `ReadOnlyMany`, which is read only. You cannot write to it or modify its content. But you can use it in many pods, as you want now as well. 
    
    4. Not all volume types support the three modes. As a general rule, block volumes don't support, `ReadWriteMany` but file based volumes like NFS or object volumes, they usually do. Check your storage systems plug in documentation to ensure its behavior. As well, if you use a volume as `ReadWriteOnce` somewhere, you can't then use it again somewhere else at the same time as `ReadWriteMany` kubernetes  keeps track of the fact that you've already got that as `ReadWriteOnce` somewhere.

4. We're mapping back to `host` in this case `minikube`

???
5. This is what happen to a PV, when is release from a claim. When you are done with the POD you can remove the PVC, but what happens with the PV? Kubernetes gives us two options, in this case is ok, unbind from PV, but keep it around. The other option is `Delete`, depends on the plug-in
but it can also remove it from the Volume provisioner
???

To create it on the cluster:

```bash
$ kubectl apply -f ./ps-pv.yml
persistentvolume/ps-pv created
```

```bash
$ kubectl get pv ps-pv
NAME    CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
ps-pv   10Mi       RWO            Retain           Available           ps-fast                 47s
```


Now to use it we need a `PVC`. Create `ps-pvc.yml`

```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ps-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ps-fast
  resources:
    requests:
      storage: 10Mi

```


If we compare PVC and PV are pretty much the same, if they don't match this is not going to work. If we go static like we go here, the PVC will bound to a PV that has the same storage or more. What PVC will never do is bind to a PV, with less capacity.


To deploy on cluster

```bash
kubectl apply -f ./ps-pvc.yml
persistentvolumeclaim/ps-pvc created
```

```bash
$ kubectl get pvc ps-pvc
NAME     STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
ps-pvc   Bound    ps-pv    10Mi       RWO            ps-fast        34s
```

If we have a look into the PV again we will find that is bound to this PVC

```bash
$ kubectl get pv ps-pv
NAME    CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM            STORAGECLASS   REASON   AGE
ps-pv   10Mi       RWO            Retain           Bound    default/ps-pvc   ps-fast                 57m
```

For last to consume it we're going to use a POD, create `ps-pod.yml`


```yml
apiVersion: v1
kind: Pod
metadata:
  name: first-pod
spec:
  volumes:
    - name: fast10m
      persistentVolumeClaim:
        claimName: ps-pvc
  containers:
  - name: ctr1
    image: ubuntu:latest
    command:
      - /bin/bash
      - "-c"
      - "sleep 60m"
    volumeMounts:
      - mountPath: /data
        name: fast10m

```

```bash
kubectl apply -f ./ps-pod.yml
```

## Cleaning resources

```bash
# Delete POD
$ kubectl delete pod first-pod
```

```bash
# Delete PVC
$ kubectl delete pvc ps-pvc
```

```bash
# Delete PV
$ kubectl delete pv ps-pv
```
