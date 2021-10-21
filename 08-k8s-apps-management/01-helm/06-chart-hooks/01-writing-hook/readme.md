# Writing a Hook

> Start from: `05-managing-dependencies/03-controlling-dependencies`

Hooks are just Kubernetes manifest files with special annotations in the `metadata` section. Because they are template files, you can use all of the normal template features, including reading `.Values`, `.Release`, and `.Template`.

Create a new file `chart/todos/templates/post-install-job.yaml`

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}"
  annotations:
    "helm.sh/hook": post-install
spec:
  template:
    metadata:
      name: "{{ .Release.Name }}"
    spec: 
      restartPolicy: Never
      containers:
      - name: post-install-job
        image: "alpine:3.3"
        command: [
          /bin/sh,
          -c,
          "echo 'I run after install'; date +%s"
        ]
```

Change directory into `chart` and run:

```bash
helm install dev todos
```

We can find a `Pod` related with the `Job`:

```bash
kubectl get pods
```

```bash
dev-backend-67896b79dc-2spjj    1/1     Running     1          70m
dev-database-64b9598967-8qn4g   1/1     Running     0          70m
dev-frontend-5ccdd7b84f-zfx62   1/1     Running     0          70m
dev-p2xvr                       0/1     Completed   0          70m
```

And we can have a look into `dev-p2xvr` logs:

```bash
kubectl logs dev-p2xvr
```

```bash
I run after install
1634839868
```

Now imagine that we want to run multiple post install actions, and we want to ensure the order of that actions `aka hooks`.

> When we run multiple, they will run serially.

Create `post-install-job-2.yaml`

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}-2"
  annotations:
    "helm.sh/hook": post-install
spec:
  template:
    metadata:
      name: "{{ .Release.Name }}-2"
    spec: 
      restartPolicy: Never
      containers:
      - name: post-install-job
        image: "alpine:3.3"
        command: [
          /bin/sh,
          -c,
          "echo 'I run after install'; date +%s"
        ]
```

Now to ensure the order we have to updat the weight property:

Update `post-install-job.yaml`

```diff
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}"
  annotations:
    "helm.sh/hook": post-install
+   "helm.sh/hook-weight": "-1"
spec:
  template:
    metadata:
      name: "{{ .Release.Name }}"
    spec: 
      restartPolicy: Never
      containers:
      - name: post-install-job
        image: "alpine:3.3"
        command: [
          /bin/sh,
          -c,
-         "echo 'I run after install'; date +%s"
+         "echo 'I run after install, Am I first?'; date +%s"
        ]
```

Update `post-install-job-2.yaml`

```diff
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}-2"
  annotations:
    "helm.sh/hook": post-install
+   "helm.sh/hook-weight": "0"
spec:
  template:
    metadata:
      name: "{{ .Release.Name }}-2"
    spec: 
      restartPolicy: Never
      containers:
      - name: post-install-job
        image: "alpine:3.3"
        command: [
          /bin/sh,
          -c,
-         "echo 'I run after install'; date +%s"
+         "echo 'I run after install, Am I second'; date +%s"
        ]
```

Let's clean before running this

```bash
helm uninstall dev
kubectl delete job dev
```

Let's install again

```bash
helm install dev todos
```

And inspect the generated pods

```bash
kubectl get pods
```

We get:

```bash
dev-2-rcfrn                     0/1     Completed   0          55s
dev-backend-67896b79dc-jnggn    1/1     Running     1          59s
dev-database-64b9598967-t4zwv   1/1     Running     0          59s
dev-frontend-5ccdd7b84f-vct2d   1/1     Running     0          59s
dev-mcgvx                       0/1     Completed   0          58s
```

```bash
kubectl logs dev-2-rcfrn
I run after install, Am I second
1634841059
```

```bash
kubectl logs dev-mcgvx
I run after install, Am I first?
1634841056
```

We can notice that the bigger weight the higher priority.

Let's clean before running this

```bash
helm uninstall dev
kubectl delete job dev
kubectl delete job dev-2
```

* TODO: Show that can be run on mutiple hooks
* TODO: Show how can we delete them 