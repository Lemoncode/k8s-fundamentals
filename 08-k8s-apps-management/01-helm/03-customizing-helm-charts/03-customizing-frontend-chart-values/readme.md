# Customizing Frontend Chart Values

We plan to reuse our charts for other applications. For that reason, we're going to customize the Helm chart templates so that they are reusable.

For this demo is recommended additional memory, 4 GB of RAM, if you are running minikube you can do it as follows.

[How to change memory minikube](https://www.shellhacks.com/minikube-start-with-more-memory-cpus/)

```bash
minikube stop
minikube delete
minikube start --driver hyperkit --memory 4096
```

```bash
kubectl get node minikube -o jsonpath='{.status.capacity}'
```

> Start from `03-customizing-helm-charts/01-helm-data`

## Steps

## 1. We will start with frontend customization

Let's start with the `ConfigMap`.

Open file `./chart/todos/charts/frontend/templates/frontend-configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  todo-title: "Default"
  backend-uri: "backend.minikube.local"
  cors: "true"
```

As you can see, there are hard‑coded values in this manifest. The name of the ConfigMap is hard coded, and the config data are hard coded.

If we want to install that chart as several releases, they need to make that name dynamic rather than static.

A solution to make it **unique is to base it on the release name and the chart name**.

```diff
apiVersion: v1
kind: ConfigMap
metadata:
- name: frontend-config
+ name: {{ .Release.Name }}-{{ .Chart.Name }}-config
data:
  todo-title: "Default"
  backend-uri: "backend.minikube.local"
  cors: "true"


```

We replace it with the `Release.Name`, dash, the `Chart.Name`. Like this, we are sure that the ConfigMap has a unique name among all the releases' ConfigMaps in the Kubernetes namespace.

Next, to make that chart reusable, we externalize the values to a `values.yaml` file. Here is how to do so. First, create a `values.yaml` file.

```bash
touch ./todos/charts/frontend values.yaml
```

Then, in that file, add a config object with two properties, guestbook‑name and backend‑uri.

```yaml
#frontend values.yaml
config:
  todo-title: "Default"
  backend-uri: "backend.minikube.local"
```

Note that the template properties do not support the dash, so we'll replace it with an underscore.

```diff
#frontend values.yaml
config:
- todo-title: "Default"
+ todo_title: "Default"
- backend-uri: "backend.minikube.local"
+ backend_uri: "backend.minikube.local"


```

Then, back to the `ConfigMap` definition, replace the hard‑coded strings with a directive that will generate the values from the values file.

The first one can be accessed from the root `.Values.config.todo_title`, and the second one from the `backend_uri.`

```diff
#update ./chart/todos/charts/frontend/templates/frontend-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.name }}-{{ .Chart.Name }}-config
data:
- todo-title: "Default"
+ todo-title: {{ .Values.config.todo_title}}
- backend-uri: "backend.minikube.local"
+ backend-uri: {{ .Values.config.backend_uri }}
  cors: "true"

```

As you can see, in this template, **we have properties from the built‑in values, Release and Chart**, and some from **custom values from the values.yaml** file. The other templates can be updated the same way.

## 2. Update frontend.yaml

The `frontend.yaml` also contains hard‑coded strings frontend for the deployment, the labels, and the container. Let's replace it with a dynamically generated name.

Again, the name of the release, dash, name of the chart. And we can replace the front‑end string with the same generated name anywhere else it is needed in the file, for the label, not for the image, but for the container name and the reference to the ConfigMap that we have just changed.

```diff
#update ./chart/todos/charts/frontend/templates/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
- name: frontend
+ name: {{ .Release.Name }}-{{ .Chart.Name }}
spec:
  replicas: 1
  selector:
    matchLabels:
-     app: frontend
+     app: {{ .Release.Name }}-{{ .Chart.Name }}
  template:
    metadata:
      labels:
-       app: frontend
+       app: {{ .Release.Name }}-{{ .Chart.Name }}
    spec:
      containers:
-       - name: frontend-ctr
+       - name: {{ .Release.Name }}-{{ .Chart.Name }}-ctr
          image: jaimesalas/todo-app-frontend:0.1.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: frontend
              containerPort: 8080
          env:
            - name: TODO_APP_API
              valueFrom:
                configMapKeyRef:
-                 name: frontend-config
+                 name: {{ .Release.Name }}-{{ .Chart.Name }}-config
                  key: backend-uri
            - name: TODO_APP_TITLE
              valueFrom:
                configMapKeyRef:
-                 name: frontend-config
+                 name: {{ .Release.Name }}-{{ .Chart.Name }}-config
                  key: todo-title
            - name: CORS_ACTIVE
              valueFrom:
                configMapKeyRef:
-                 name: frontend-config
+                 name: {{ .Release.Name }}-{{ .Chart.Name }}-config
                  key: cors
          resources: {}

```

There are other hard‑coded values that we would like to externalize. For example, for the replicas number if they want to scale the application easily. So let's create a replicaCount value in the `values.yaml` file and use a directive to replace it in the template.

```diff
#update ./chart/todos/charts/frontend/values.yaml
config:
  todo_title: "Default"
  backend_uri: "backend.minikube.local"
+replicaCount: 1
```

```diff
#update ./chart/todos/charts/frontend/templates/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
spec:
- replicas: 1
+ replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
# ....
```

Also, we would like to change the image easily if a new version of the application has been deployed. The image name has two parts, the repository and the tag.

So let's create an image object in the `values.yaml` file with two poverties, the Docker Hub repository, `jaimesalas/todo-app-frontend`, and the tag, `0.1.0`.

> Note that the tag must be a string. If it's a number, the .0 will be removed by the template engine.

```diff
#update ./chart/todos/charts/frontend/values.yaml
config:
  todo_title: "Default"
  backend_uri: "backend.minikube.local"
replicaCount: 1
+image:
+ repository: jaimesalas/todo-app-frontend
+ tag: "0.1.0"

```

And again, two directives are used to replace those values in the template.

```diff
#update ./chart/todos/charts/frontend/templates/frontend.yaml
spec:
  containers:
    - name: {{ .Release.Name }}-{{ .Chart.Name }}-ctr
-     image: jaimesalas/todo-app-frontend:0.1.0
+     image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
```

That way, if we relrease a new version of the application, we do not have to edit the deployment file anymore. We just change the image tag in the `values.yaml` file and run `helm upgrade`.

The service also has a hard‑coded front‑end name that can be replaced the same way, with our dynamic name Release, dash, Chart.

```diff
#update ./chart/todos/charts/frontend/templates/frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
-   name: frontend
+   name: {{ .Release.Name }}-{{ .Chart.Name}}
- # name: frontend
+ name: {{ .Release.Name }}-{{ .Chart.Name}}
spec:
  selector:
-   app: frontend
+   app: {{ .Release.Name }}-{{ .Chart.Name}}
  ports:
    - port: 80
      targetPort: 8080

```

The port number is hard coded, and it might change in the future, so it has to be externalized to the `values.yaml` file. We would like to be able to change the service type to NodePort when we are in a development environment instead of the default ClusterIP, so we add a service object with a port property and the type property in the `values.yaml` file.

```diff
#update ./chart/todos/charts/frontend/values.yaml
config:
  todo_title: "Default"
  backend_uri: "backend.minikube.local"
replicaCount: 1
image:
  repository: jaimesalas/todo-app-frontend
  tag: "0.1.0"
+service:
+ port: 80
+ type: ClusterIP
```

And we replace the values with directives in the template, one for the port and one for the service type.

```diff
#update ./chart/todos/charts/frontend/templates/frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    name: {{ .Release.Name }}-{{ .Chart.Name}}
  name: {{ .Release.Name }}-{{ .Chart.Name}}
spec:
+ type: {{ .Values.service.type }}
  selector:
    app: {{ .Release.Name }}-{{ .Chart.Name}}
  ports:
-   - port: 80
+   - port: {{ .Values.service.port }}
      targetPort: 8080

```

Last, the ingress. As we can see for now, we have one ingress for both the front end and the back end. This is not a good design. A chart should be standalone and should not depend on other charts.

So we split it between the back end and the front end. We cut the part corresponding to the back end and pass it back into a new ingress in the back‑end chart, and we only keep the part related to the front‑end chart.

```diff
#update ./chart/todos/charts/frontend/templates/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
spec:
  rules:
    - host: frontend.minikube.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
-   - host: backend.minikube.local
-     http:
-       paths:
-         - path: /
-           pathType: Prefix
-           backend:
-             service:
-               name: backend
-               port:
-                 number: 80


```

The ingress also has string hard coded. Let's change this with the dynamic name.

```diff
#update ./chart/todos/charts/frontend/templates/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
- name: todo-ingress
+ name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
spec:
  rules:
```

And the host name is a variable that could change. So, an ingress object with the host property is added to `values.yaml` file, and a directive is used to inject that value into the template.

```diff
#update ./chart/todos/charts/frontend/values.yaml
config:
  todo_title: "Default"
  backend_uri: "backend.minikube.local"
replicaCount: 1
image:
  repository: jaimesalas/todo-app-frontend
  tag: "0.1.0"
service:
  port: 80
  type: ClusterIP
+ingress:
+ host: frontend.minikube.local
```

```diff
#update ./chart/todos/charts/frontend/templates/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
spec:
  rules:
-   - host: frontend.minikube.local
+   - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
-               name: frontend
+               name: {{ .Release.Name }}-{{ .Chart.Name }}
                port:
                  number: 80
```

That's it for the frontend. We have to do the same job for the back end and for the database.

> Exercise: Create values and replace on database and backend.

- Create `charts/backend/values.yaml`

```yaml
secret:
  mongodb_uri: bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvdG9kb2RiP2F1dGhTb3VyY2U9YWRtaW4K
  # mongodb://admin:password@mongodb:27017/tododb?authSource=admin
image:
  repository: jaimesalas/todo-app-api
  tag: "0.1.0"

replicaCount: 1

service:
  type: ClusterIP
  port: 80

ingress:
  host: backend.minikube.local
```

- Create `charts/backend/templates/ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
spec:
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {{ .Release.Name }}-{{ .Chart.Name }}
                port:
                  number: 80
```

- Update `charts/backend/templates`

- Create `charts/database/values.yaml`

```yaml
secret:
  mongodb_username: "YWRtaW4="
  mongodb_password: "cGFzc3dvcmQ="
volume:
  storage: 100Mi
```

- Update `charts/database/templates`

When this is done, we first check the templates with the command `helm template`, name of the chart.
extensions/v1beta1

We can run a second check with `helm install [NAME] [CHART] ‑‑dry‑run ‑‑debug`.

```bash
helm install demo todos --dry-run --debug
```

Notice that they now have more data, including debug data where you can find bugs in your template, computed values, as they are seen by the template engine, and the generated manifest. Notice that the release name is now `demo`.

If everything is okay, we can run a `helm install` without a dry run to install the actual release.

```bash
helm install demo todos
```

All the resources are being created, and if we wait a little bit, we can check that the services are available and that the ports are running.

There is an error with the back end. Let's look at the Minikube dashboard to analyze this.

```bash
minikube dashboard
```

The back end is failing. Let's check the logs. MongoDB not found. Ah, yes, we get it. Now the database service name is dynamically generated based on the release name, so it's not MongoDB anymore as hard coded in the mongodb_uri in the back‑end secret. We'll solve that issue in the next demo.

```
MongoNetworkError: failed to connect to server [mongodb:27017] on first connect [MongoNetworkError: getaddrinfo ENOTFOUND mongodb mongodb:27017]
    at Pool.<anonymous> (/home/node/app/node_modules/mongodb/lib/core/topologies/server.js:441:11)
    at emitOne (events.js:116:13)
    at Pool.emit (events.js:211:7)
    at createConnection (/home/node/app/node_modules/mongodb/lib/core/connection/pool.js:564:14)
    at connect (/home/node/app/node_modules/mongodb/lib/core/connection/pool.js:1000:11)
    at makeConnection (/home/node/app/node_modules/mongodb/lib/core/connection/connect.js:32:7)
    at callback (/home/node/app/node_modules/mongodb/lib/core/connection/connect.js:300:5)
    at Socket.err (/home/node/app/node_modules/mongodb/lib/core/connection/connect.js:330:7)
    at Object.onceWrapper (events.js:315:30)
    at emitOne (events.js:116:13)
```
