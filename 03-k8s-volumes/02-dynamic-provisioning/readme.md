# Dynamic Provisioning Demo

We're going to do provisioning with storage classes. 

On `minikube` ensure that `storage-provisioner` and `default-storageclass` are enabled. We can find out by running:

```bash
$ minikube addons list
```

To find out the provisioner run:

```bash
$ kubectl get storageclass
NAME                 PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
standard (default)   k8s.io/minikube-hostpath   Delete          Immediate           false                  236d
```

Create `lc-sc.yml`

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: host-first-consumer
provisioner: k8s.io/minikube-hostpath
volumeBindingMode: WaitForFirstConsumer
```

In this case we're working with `minikube`, but if we would be working with any cloud provider out there (or on-premises), the `StorageClass` will look as follows:

```yml
kind: StorageClass
apiVersion: storage.k8s.io/v1 # 1.
metadata:
  name: host-fast # 2
  annotations: # 3
      storageclass.kubernetes.io/is-default-class: "true"
provisioner: <any provisioner> # 4
volumeBindingMode: WaitForFirstConsumer # 5
parameters: # 6
  type: pd-ssd
  replication-type: none

```

1. This here is a storage class. It's a first class object in the Kubernetes API only this time it's defined under the `storage.k8s.io` API subgroup. Being part of an API subgroup doesn't mean it is any less of a legit object than something in the core API group. It just means it's a bit newer, and it wasn't around back in the early days when we stuffed everything into the monolithic core API group.

2. Meaningful name.

3. This way we set up this as default class for the cluster. Any PVC, that don't request a particular storage gets the cluster default class.

4. The provisioner defines the plugin

5. This volume binding mode wait for first consumer will hold off on the actual creation of the back end volume on the PV until a pod is started. That uses it so you can create a PVC for this class. But the actual assets won't be created until a pod uses it.

6. Anything on the parameters here relates to specific attributes on your storage back end. So what you put in here depends 100% on your plug in on your back end. AWS, for example, right on their SSD volumes, they let you specify things like whether or not to encrypt the volume on which encryption keys to use.


To start the storage class:

```bash
$ kubectl apply -f ./lc-sc.yml 
storageclass.storage.k8s.io/host-first-consumer created
```

```bash
$ kubectl get sc
NAME                  PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
host-first-consumer   k8s.io/minikube-hostpath   Delete          WaitForFirstConsumer   false                  28s
standard (default)    k8s.io/minikube-hostpath   Delete          Immediate              false                  64d
```

We can edit the storage class and change the standar we can do that by:

```bash
$ kubectl edit sc standard
Edit cancelled, no changes made.
```


Now there's no PV's, the hold point is that **the PV is created on demand**. So in the background, right, like anything that's kubernetes native, there is a controller running on the masters, and in this case, they're watching the API server on looking for new PVCs. That reference this `host-first-cosnumer` class. Any time the controller sees one, it magically creates the right type of volume on the external storage back end, and it creates the PV, so we don't need to create PVs anymore. But we do need to create the PVCs that reference them.

Lets create a manifest that declares a claim and a pod. Create `lc-scpod.yml`

```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-htmlvol # 1
spec:
  storageClassName: "host-first-consumer" # 1
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Mi
---
apiVersion: v1
kind: Pod
metadata:
  name: sc-pod
  labels:
    app: stg
spec: 
  volumes:
    - name: htmlvol 
      persistentVolumeClaim: # 2
        claimName: pvc-htmlvol
  containers:
    - name: main-ctr
      image: nginx
      ports:
        - containerPort: 80
          name: "http-server"
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: htmlvol
    - name: helper-ctr
      image: ubuntu
      command:
      - /bin/bash
      - "-c"
      - "sleep 60m"
      volumeMounts:
      - mountPath: /data
        name: htmlvol
---
apiVersion: v1
kind: Service
metadata:
  name: lb
spec:
  selector:
    app: stg
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer

```

1. This is the claim that is using the class that we have created `host-fast`

Remind that we have created with `WaitForFirstConsumer`, so just by adding a PVC, is not going to be created.

2. The POD declares a volume that will mounted by the containers, is here when the volume is created.


> TODO: Add diagram


Lets deploy this

> NOTE: If we're using `minikube` and we want to use the LB, we have to run `minikube tunnel` in another terminal

```bash
$ kubectl apply -f ./ps-scpod.yml 
persistentvolumeclaim/pvc-htmlvol created
pod/sc-pod created
service/lb created
```

If we look for the volume, now is created:

```bash
 kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS   REASON   AGE
pvc-dbbb7ef6-17b9-4157-bf2c-b2b665ed17bc   10Mi       RWO            Delete           Bound    default/pvc-htmlvol   host-fast               6m2s
```

We can inspect the pod and we will find out that containers are mounting the volume

```bash
$ kubectl describe pod sc-pod
# .....
Containers:
  main-ctr:
    Container ID:   docker://a3561be71f357662268b06ab19827e793c26c64c3baec601c34a042ce36aa977
    Image:          nginx
    Image ID:       docker-pullable://nginx@sha256:6d75c99af15565a301e48297fa2d121e15d80ad526f8369c526324f0f7ccb750
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Sat, 19 Jun 2021 20:31:05 +0200
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /usr/share/nginx/html from htmlvol (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-6c95g (ro)
  helper-ctr:
    Container ID:  docker://a6fe088c86cd27eacf91fb177d8ecea5eafdb9aeae1343fe86828a4b3635b944
    Image:         ubuntu
    Image ID:      docker-pullable://ubuntu@sha256:aba80b77e27148d99c034a987e7da3a287ed455390352663418c0f2ed40417fe
    Port:          <none>
    Host Port:     <none>
    Command:
      /bin/bash
      -c
      sleep 60m
    State:          Running
      Started:      Sat, 19 Jun 2021 20:31:12 +0200
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /data from htmlvol (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-6c95g (ro)
```

To find out where is running our Load Balancer:

```bash
 kubectl get svc
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)        AGE
kubernetes   ClusterIP      10.96.0.1       <none>          443/TCP        28d
lb           LoadBalancer   10.107.80.160   10.107.80.160   80:30178/TCP   41s
```

If we visit `http://10.107.80.160/` this is not going to work, because we're mapping to an empty volume. 

If we jump into the helper container, that have the same volume:

```bash
$ kubectl exec -it sc-pod -c helper-ctr -- /bin/bash
```

Run the following command to put some text here:

```bash
root@sc-pod:/# echo 'Lemoncode!!' > ./data/index.html
```

Now if we refresh the web page we must see it.

### Notes

* Create Storage Classes according to business requirements and tech capabilities

* Storage Classes are immutable objects

## Clean up

```bash
$ kubectl delete -f ./ps-scpod.yml
```

```bash
$ kubectl delete storageclass host-fast
```

```bash
minikube tunnel --cleanup
```
