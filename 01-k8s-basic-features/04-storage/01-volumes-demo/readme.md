# Volumes Demo

Create `nginx-alpine-emptyDir.pod.yaml`

Using _emptyDir_

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-alpine-volume
  labels:
    name: nginx-alpine-volume
spec:
  containers:
    - name: nginx # 2.
      image: nginx:alpine
      volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
          readOnly: true
      resources: {}
    - name: html-updater # 1.
      image: alpine
      command: ["/bin/sh", "-c"]
      args:
        - while true; do date >> /html/index.html; sleep 10; done
      resources: {}
      volumeMounts:
        - name: html
          mountPath: /html
  volumes:
    - name: html
      emptyDir: {} # 3.


```

1. This container is writing into `index.html` and mounting `html` volume
2. This container is reading from `html` volume
3. The volume that we're decalring here is lifecycle tied to Pod, because is using empty directory.

```bash
kubectl apply -f nginx-alpine-emptyDir.pod.yml
```

```bash
kubectl port-forward nginx-alpine-volume 8080:80
```

If we `google localhost:8080`, we must see every 10 seconds a new date entry.

1. Create `docker-hostPath.pod.yaml`

Using _hostPath_

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: docker-volume
spec:
  containers:
  - name: docker
    image: docker
    command: ["sleep"]
    args: ["100000"]
    volumeMounts:
      - name: docker-socket
        mountPath: /var/run/docker.sock
    resources: {}
  volumes:
  - name: docker-socket
    hostPath: # 1.
      path: /var/run/docker.sock
      type: Socket  
```

1. When we use `hostPath`, we're creating a volume associated to a node, where the POD is currrently scheduled. In a real world scenario, pods can be re scheduled to different machines / nodes. And we can loose the volume that we're looking for, we can use affinity to try to solve this, but there is a big chance that we can find that volume.

Notice that we have _type_ attribute here. The valid types are:

* DirectoryOrCreate
* Directory
* FileOrCreate
* File
* Socket
* CharDevice
* BlockDevice

```bash
kubectl apply -f docker-hostPath.pod.yaml
```

Now if we describe the pod, we must see the new volume defined.

```bash
kubectl describe pod/docker-volume
# ...
Volumes:
  docker-socket:
    Type:          HostPath (bare host directory volume)
    Path:          /var/run/docker.sock
    HostPathType:  Socket
  kube-api-access-bqqjb:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
```

Once Pod is created you can shell into it to run Docker commands:

```bash
kubectl exec docker-volume -it -- sh
```

Now inside the container, we have access to node docker daemon!! If we simply run `docker`, we will find that we can use the command, also run `docker ps`, did you expect that :).


### Cleanup

```bash
kubectl delete -f ./
```
