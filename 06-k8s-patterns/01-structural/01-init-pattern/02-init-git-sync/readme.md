# Init Git Sync Demo

## Steps

Create the `init-git-sync.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: git-syncer
  labels:
    app: git-syncer
spec:
  initContainers:
    - image: k8s.gcr.io/git-sync:v3.1.5
      name: init-sync-ctr
      volumeMounts:
        - name: html
          mountPath: /tmp/git
      env:
      - name: GIT_SYNC_REPO
        value: https://github.com/JaimeSalas/lc-sidecar.git
      - name: GIT_SYNC_BRANCH
        value: main
      - name: GIT_SYNC_DEPTH
        value: "1"
      - name: GIT_SYNC_DEST
        value: "html"
      - name: GIT_SYNC_ONE_TIME
        value: "true" 
  containers:
  - name: web
    image: nginx
    volumeMounts:
      - name: html
        mountPath: /usr/share/nginx
    resources: {}
  volumes:
    - name: html
      emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: git-syncer
spec:
  selector:
    app: git-syncer
  ports:
  - port: 80
  type: LoadBalancer
```

In the previous yaml, we have created two containers, one on `initContainers` and the other one an app container. 

We have a service as well, the goal of this service is to expose the container app to the outer world.

The content that is served by the container app, comes from a shared volume with the init container.

The init container is based on `k8s.gcr.io/git-sync:v3.1.5`, and mounts the same volume.

The key note here is that both containers have access to the same volume. 

Let's review the `init container`

```yaml
initContainers:
    - image: k8s.gcr.io/git-sync:v3.1.5
      name: init-sync-ctr
      volumeMounts:
        - name: html
          mountPath: /tmp/git
      env:
      - name: GIT_SYNC_REPO
        value: https://github.com/JaimeSalas/lc-sidecar.git
      - name: GIT_SYNC_BRANCH
        value: main
      - name: GIT_SYNC_DEPTH
        value: "1"
      - name: GIT_SYNC_DEST
        value: "html"
      - name: GIT_SYNC_ONE_TIME
        value: "true"
```

The `init container` will clone a Git repository pulling the content on `main` branch to a file called `html`, the file will be placed into `mountPath: /tmp/git`. 

So `init-sync-ctr`, is going to pull content from `GitHub` to the shared volume, and the main app will serve this content using `nginx`.

```bash
$ kubectl apply -f init-git-sync.yaml
```

If we're running this on `minkube` remember, that we will need a tunnel in order to access the `LoadBalancer` service. 

Open a new terminal and run:

```bash
$ minikube tunnel
```

Now we can grab the public IP:

```bash
kubectl get svc
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)        AGE
git-syncer   LoadBalancer   10.101.202.72   10.101.202.72   80:30670/TCP   4m9s
```

And visit in our local browser `10.101.202.72` to see our page.

### Clenaup

```bash
$ kubectl delete -f ./
```
