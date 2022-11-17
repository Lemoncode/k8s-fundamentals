# Sidecar Pattern

The other structural pattern that we will have a look on, will be on a same way a `sidecar`, what we're covering here is a generic `sidecar`.

The main difference with init containers, is that these containers runs on parallel with the app container. So these containers DON'T run first than the application container.

> Init Container: Runs to completion before app container starts

> Sidecar container: Start with app container and runs concurrently

## Steps

We will start from `init-git-sync.yaml`. Create `sidecar.yaml`:


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

From this point, the served content is only load once, when the pod gets started. What can we do if we want regular updates?  For this use case we need a `sidecar` that runs on parallel with the app container and periodically syncs.

Update `sidecar.yaml`

```diff
apiVersion: v1
kind: Pod
metadata:
  name: git-syncer
  labels:
    app: git-syncer
spec:
-  initContainers:
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

And then move to the `containers` section:

```diff
apiVersion: v1
kind: Pod
metadata:
  name: git-syncer
  labels:
    app: git-syncer
spec:
-   - image: k8s.gcr.io/git-sync:v3.1.5
-     name: init-sync-ctr
-     volumeMounts:
-       - name: html
-         mountPath: /tmp/git
-     env:
-     - name: GIT_SYNC_REPO
-       value: https://github.com/JaimeSalas/lc-sidecar.git
-     - name: GIT_SYNC_BRANCH
-       value: main
-     - name: GIT_SYNC_DEPTH
-       value: "1"
-     - name: GIT_SYNC_DEST
-       value: "html"
-     - name: GIT_SYNC_ONE_TIME
-       value: "true" 
  containers:
  - name: web
    image: nginx
    volumeMounts:
      - name: html
        mountPath: /usr/share/nginx
    resources: {}
  
+ - image: k8s.gcr.io/git-sync:v3.1.5
+   name: init-sync-ctr
+   volumeMounts:
+     - name: html
+       mountPath: /tmp/git
+   resources: {}
+   env:
+   - name: GIT_SYNC_REPO
+     value: https://github.com/JaimeSalas/lc-sidecar.git
+   - name: GIT_SYNC_BRANCH
+     value: main
+   - name: GIT_SYNC_DEPTH
+     value: "1"
+   - name: GIT_SYNC_DEST
+     value: "html"
+   - name: GIT_SYNC_ONE_TIME
+     value: "true" 
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

To make that `k8s.gcr.io/git-sync:v3.1.5` sync more than once, we need to update its configuration, we cna notice that this section, is the one that is making that just syncs once:

```yaml
- name: GIT_SYNC_ONE_TIME
    value: "true" 
```
 Let's remove it, update `sidecar.yaml`

 ```diff
 apiVersion: v1
kind: Pod
metadata:
  name: git-syncer
  labels:
    app: git-syncer
spec:
    # - image: k8s.gcr.io/git-sync:v3.1.5
    #   name: init-sync-ctr
    #   volumeMounts:
    #     - name: html
    #       mountPath: /tmp/git
    #   env:
    #   - name: GIT_SYNC_REPO
    #     value: https://github.com/JaimeSalas/lc-sidecar.git
    #   - name: GIT_SYNC_BRANCH
    #     value: main
    #   - name: GIT_SYNC_DEPTH
    #     value: "1"
    #   - name: GIT_SYNC_DEST
    #     value: "html"
    #   - name: GIT_SYNC_ONE_TIME
    #     value: "true" 
  containers:
  - name: web
    image: nginx
    volumeMounts:
      - name: html
        mountPath: /usr/share/nginx
    resources: {}
  
  - image: k8s.gcr.io/git-sync:v3.1.5
    name: init-sync-ctr
    volumeMounts:
      - name: html
        mountPath: /tmp/git
    resources: {}
    env:
    - name: GIT_SYNC_REPO
      value: https://github.com/JaimeSalas/lc-sidecar.git
    - name: GIT_SYNC_BRANCH
      value: main
    - name: GIT_SYNC_DEPTH
      value: "1"
    - name: GIT_SYNC_DEST
      value: "html"
-   - name: GIT_SYNC_ONE_TIME
-     value: "true" 
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

Let's run this

```bash
kubectl apply -f sidecar.yml
```

Two containers on both of running. 

```bash
kubectl get pods --watch
```

If we check the service, grab this public IP here. And let's have a look at what we've got. 

> NOTE: Run `minikube tunnel`

```bash
kubectl get svc
```

### Cleanup

```bash
kubectl delete -f ./
```
