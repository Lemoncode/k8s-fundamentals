## Storage Core Concepts

__Question:__ How do you store application state/data and exchange it between Pods with Kubernetes?
__Answer:__ Volumes (although other data storage options exist)

> A Volume can be used to hold data and state for Pods and containers.

* Pods live and die so their file system in short-lived (ephemeral)
* Volumes can be used to store state/data and use it in a Pod
* A Pod can have multiple Volumes attached to it
* Containers rely on a mountPath to access a Volume
* Kubernetes supports:
    - Volumes
    - PersistentVolumes
    - PersistentVolumeClaims
    - StorageClasses

## Volumes

* A Volume references a storage location
* Must have a unique name
* Attached to a Pod and may or may not be tied to the Pod's lifetime (depending on the Volume type)
* A Volume Mount references a Volume by name and defines a `mountPath`

* Volumes Type Examples
    - __emptyDir__ - Empty directory for storing "transiet" data (shares a Pod's lifetime) useful for sharing files between containers running in a Pod.
    - __hostPath__ - Pod mounts into the node's filesystem
    - __nfs__ An NFS (Network File System) share mounted into the Pod
    - __configMap/secret__ - Special types of volumes that provide a Pod with access to Kubernetes resources
    - __persistentVolumeClaim__ - Provide Pods with a more persistent storage option that is abstracted from the details
    - __Cloud__ - Cluster-wide storage

### Defining an emptyDir Volume

```yaml
apiVersion: v1
kind: Pod
spec:
  volumes: # 1.
  - name: html
    emptyDir: {}
  containers:
  - name: nginx
    image: nginx:alpine
    volumeMounts: # 2.
      - name: html
        mountPath: /usr/share/nginx/html
        readOnly: true
  - name: html-updated
    image: alpine
    command: ["/bin/sh", "-c"]
    args:
      - while true; do date >> /html/index.html;
          sleep 10; done
    volumeMounts: # 3.
      - name: html
        mountPath: /html
```

1. Define initial Volume named "html" that is an empty directory (lifetime of the Pod)

```yaml
volumes:
    - name: html
      emptyDir: {}
```

1. We mount it into the container `nginx` as read only.

```yaml
volumeMounts:
  - name: html
    mountPath: /usr/share/nginx/html
    readOnly: true
```

3. Reference "html" Volume and define a mountPath in the `html-updated` container.

```yaml
volumeMounts:
  - name: html
    mountPath: /html
```

Update file in Volume mount/html path with latest date every 10 seconds
Reference "html" Volume (defined above) and define a mountPath

### Defining a hostPath Volume

```yaml
apiVersion: v1
kind: Pod
spec:
  volumes: # 1.
    - name: docker-socket
      hostPath: 
        path: /var/run/docker.sock
        type: Socket
  containers:
  - name: docker
    image: docker
    command: ["sleep"]
    args: ["100000"]
    volumeMounts: # 2.
      - name: docker-socket
        mountPath: /var/run/docker.sock
```

1. We defined a volume host path on the node, named `/var/run/docker.sock`, in this case pointing to `/var/run/docker.sock`.

```yaml
volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
      type: Socket
```

2. On `docker` container we reference "docker-socket" Volume and define mountPath:

```yaml
containers:
  - name: docker
    image: docker
    command: ["sleep"]
    args: ["100000"]
    volumeMounts: # 2.
      - name: docker-socket
        mountPath: /var/run/docker.sock
```

* Clud Volumes
    - Cloud providers (Azure, AWS, GCP, etc.) support different types of Volumes:
        * Azure - Azure Disk and Azure File
        * AWS - Elastik Block Store
        * GCP - GCE Persistent disk

### Defining an Azure File Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  volumes:
  - name: data
    azureFile: # 1.
      secretName: <azure-secret>
      shareName: <share-name>
      readOnly: false
  containers:
  - image: someimage
    name: my-app
    volumeMounts: # 2.
    - name: data
      mountPath: /data/storage
```

1. Define initial Volume named "data" that is Azure File storage

```yaml
volumes:
  - name: data
    azureFile:
      secretName: <azure-secret>
      shareName: <share-name>
      readOnly: false
```

2. Reference "data" Volume and define a mountPath

```yaml
volumeMounts:
    - name: data
      mountPath: /data/storage
```

### Defining an AWS Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  volumes: # 1.
  - name: data
    awsElasticBlockStore:
      volumeID: <volume_ID>
      fsType: ext4 
  containers:
  - image: someimage
    name: my-app
    volumeMounts: # 2.
    - name: data
      mountPath: /data/storage
```

1. We define an `AWS ELB` (Elastic Block Store) 

```yaml
volumes:
  - name: data
    awsElasticBlockStore:
      volumeID: <volume_ID>
      fsType: ext4
```

2. Define initial Volume named "data" that is awsElasticBlockStore

```yaml
containers:
  - image: someimage
    name: my-app
    volumeMounts: # 2.
    - name: data
      mountPath: /data/storage
```

### Defining a Google Cloud gcePersistentDisk Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  volumes: # 1.
  - name: data
    gcePersistentDisk:
      pdName: datastorage
      fsType: ext4 
  containers:
  - image: someimage
    name: my-app
    volumeMounts:
    - name: data
      mountPath: /data/storage
```

1. Define initial Volume named "data" that is gcePersistentDisk

```yml
volumes:
  - name: data
    gcePersistentDisk:
      pdName: datastorage
      fsType: ext4 
```

> Viewing a Pod's Volumes: Several different techniques can be used to view a Pod's Volumes

```bash
# Describe Pod
kubectl describe pod [pod-name]
```

```bash
kubectl get pod [pod-name] -o yaml
```

## Volumes Demo

[volumes demo](01-volumes-demo/readme.md)

## PersistentVolumes and PersistentVolumeClaims

> A PersistentVolume (PV) is a cluster-wide storage unit provisioned by an administrator with a lifecycle indepenedent from a Pod.

In order to use one of these, we need a `PersistentVolumeClaim`

> A PersistentVolumeClaim (PVC) is a request for a storage unit (PV).

* A PersistentVolume is a cluster-wide storage resources on network-attached storage (NAS)
* Normally provisioned by a cluster administrator
* Available to a Pod even if it gets reescheduled to a different Node
* Rely on a storage provider such as NFS, cloud storage, or other options
* Associated with a Pod by using a PersistenVolumeClaim (PVC)

### PersistentVolume Workflow

1. Create network storage resource (NFS, cloud, etc.)
2. Define a Persistent Volume (PV) and send to the Kubernetes API
3. Create a PersistentVolumeClaim (PVC)
4. Kubernetes binds the PVC to the PV
5. Pod Volume references the PVC

## PersistentVolumes and PersistentVolumeClaim YAML

### Defining a PersistentVolume for Azure

```yaml
apiVersion: v1
kind: PersistentVolume # 1
metadata: 
  name: my-pv
spec:
  capacity: 10Gi # 2
  accessModes: 
    - ReadWriteOnce # 3
    - ReadOnlyMany # 4
  persistentVolumeRelaimPolicy: Retain # 5
  azureFile: # 6
    secretName: <azure-secret>
    shareName: <name_from_azure>
    readOnly: false
```

1. Create PersistentVolume kind
2. Define storage capacity
3. One client can mount for read/write
4. Many clients can mount for reading
5. Retain even after claim is deleted (not erased/deleted)
6. Reference storage to use (specific to Cloud provider, NFS setup, etc.)

### Defining a PersistentVolumeClaim

```yaml
kind: PersistentVolumeClaim # 1
apiVersion: v1
metadata:
  name: pv-dd-account-hdd-5g
  annotations: 
    volume.beta.kubernetes.io/storage-class: accounthdd
spec:
  accessModes: # 2
  - ReadWriteOnce
  resources: 
    requests: # 3
      storage: 5Gi
```

1. Define a PersistentVolumeClaim (PVC)
2. Define access mode
3. Request storage ammount

### Using a PersistentVolumeClaim

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: pod-uses-account-hdd-5g
  labels:
    name: storage
spec:
  containers:
  - image: nginx
    name: az-c-01
    command:
    - /bin/sh
    - -c
    - while true; do echo $(date) >>
      /mnt/blobdisk/outfile; sleep 1; done
    volumeMounts:
    - name: blobdis01
      mountPath: /mnt/blobdisk
  volumes:
  - name: blobdisk01
    persistentVolumeClaim:
      claimName: pv-dd-account-hdd-5g
```

```
volumes:
  - name: blobdisk01
    persistentVolumeClaim:
      claimName: pv-dd-account-hdd-5g
```

Create volume that binds to PersistentVolumeClaim

```
volumeMounts:
    - name: blobdis01
      mountPath: /mnt/blobdisk
```

Mount to Volume

> Reference: https://github.com/kubernetes/examples

## StorageClasses

> A StorageClass (SC) is a type of storage template that can be used to dinamycally provision storage.

* Used to define different "classes" of storage
* Act as a type of storage template
* Supports dynamic provisioning of PersistentVolumes
* Administrators don't have to create PVs in advance

### StorageClass Workflow

1. Create Storage Class
2. Create a PersistentVolumeClaim that references StorageClass
3. Kubernetes uses StorageClass provisioner to provision a PersistentVolume
4. Storage provisioned, PersistentVolume created and bound to PersistentVolumeClaim
5. Pod volume references PersistentVolumeClaim

### Defining a Local Storage StorageClass

```yaml
apiVersion: storage.k8s.io/v1 # 1
kind: StorageClass # 2
metadata:
  name: local-storage
reclaimPolicy: Retain # 3
provisioner: kubernetes.io/no-provisioner # 4
volumeBindingMode: WaitForFirstConsumer # 5
```

1. API version
2. A StorageClass resource
3. Retain storage or delete (default) after PVC is released
4. Provisioner (volume plugin) that will be used to create PersistentVolume resource
5. Wait to create until Pod making PVC is created. Default is Immediate (create once PVC is created)

### Defining a Local Storage PersistentVolume

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 10Gi
  volumeMode: Block
  acccessModes:
  - ReadWriteOnce # 1
  storageClassName: local-storage # 2
  local: # 3
    path: /data/storage
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - <node-name>
```

1. One client can mount for read/write
2. Reference StorageClass
3. Path where data is stored on Node

```
nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - <node-name>
```

Select the node where the local storage PV is created

### Defining a PersistentVolumeClaim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim # 1
metadata:
  name: my-pvc
spec:
  accessModes: # 2
  - ReadWriteOnce
  storageClassName: local-storage
  resources:
    requests: # 3
      storage: 1Gi
```

1. Define a PersistentVolumeClaim (PVC)
2. Access Mode as storage classification PV needs to support
3. Storage request information

### Using a PersistentVolumeClaim

[StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)

```yaml
apiVersion: apps/v1
kind: [Pod | StatefulSet | Deployment]
...
  spec:
    volumes:
    - name: my-volume
      persistentVolumeClaim:
        claimName: my-pvc
```

## PersistentVolumes Demo

> Show as an exercise after volumes in depth.

```yml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner

reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
```

* The reclaim policy applies to the persistent volumes not to the storage class itself.

* pvs and pvcs that are created using that storage class will inherit the reclaim 
policy set

```yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongo-pv
spec:
  capacity:
    storage: 1Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  storageClassName: local-storage
  hostPath:
    path: /data/db/
```

* StorageClass has a reclaim policy default so it'll be inherited by the PV presistentVolumeReclaimPolicy: Retain.

* Notice that we're using `storageClassName: local-storage`

* Because we're using _minikube_, we're dealing with _hostPath_

To use it we have a _pvc_

```yaml
apiVersion: v1 
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
spec: 
  accessModes:
  - ReadWriteOnce
  storageClassName: local-storage
  resources:
    requests:
      storage: 1Gi
```

* Notice `storageClassName: local-storage` 

To use it, we have a special type of deployment, __Kubernetes StatefulSet__: Manages the deployment and scaling of a set of Pods, and provides guarantees about the ordering and uniqueness of these Pods.

* Start up the Pod:

  `kubectl create -f mongo.deployment.yml`

* Run `kubectl get pods` to see the pod. If isn't working we can run `kubectl describe statefulset.apps/mongo` and have an idea about what is going on.

```bash
$ kubectl get pods
NAME      READY   STATUS    RESTARTS   AGE
mongo-0   1/1     Running   0          4m54s
```

* Run `kubectl exec [mongo-pod-name] -it sh` to shell into the container. Run the `mongo` command to make sure the database is working. Type `exit` to exit the shell.

* Delete the mongo Pod: `kubectl delete pod [mongo-pod-name]`

* Once the pod is deleted, run `kubectl get pv` and note the reclaim policy that's shown and the status (should show Bound since the policy was Retain)

* Delete everything else: `kubectl delete -f mongo.deployment.yml`

