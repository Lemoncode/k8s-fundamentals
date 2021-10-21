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
          "echo 'I run after install'"
        ]
```

Change directory into `chart` and run:

```bash
helm install dev todos
```