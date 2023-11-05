# Controlling Dependencies with Conditions and Tags

> Start from: `05-managing-dependencies/01-packaging-and-publishing-charts`
> NOTE: Remove `chart/todos/charts` and `chart/dist`
> NOTE: ChartMuseum must be running in our system

```
./
└───app   
└───chart/
    └───todos/
        └─── templates/
        │   Chart.yaml
        │   values.yaml
```

Now we have a special request for a lightweight release containing only the front end to test the UI on the local cluster. 

We need to provide a Helm chart to install the umbrella chart without the back end and the database. 

For that purpose, we added the `Chart.yaml` file and added condition and tag properties. 

Update `./chart/todos/Chart.yaml`

```yaml
apiVersion: v2
name: todos
appVersion: "2.0"
description: A Helm chart for Todos Awesome App 1.1
version: 1.1.0
type: application
dependencies:
  - name: backend
    version: ~0.1.0
    repository: http://localhost:8080
    condition: backend.enabled
    tags:
      - api
  - name: frontend
    version: ^1.1.0
    repository: http://localhost:8080
  - name: database
    version: ~0.1.0
    repository: http://localhost:8080
    condition: database.enabled
    tags:
      - api
  

```

The `backend` is not installed if the `backend.enabled` property exists and **is set to false**. We also add an api tag to that subchart. And it's the same for the `database`. It's not installed if the `database.enabled` exists and is set to false. The database chart is also part of the API, so it's also tagged with an api tag. 

Let's now define the values in the `values.yaml` file. 

Update `./chart/todos/values.yaml`

```yaml
backend:
  enabled: true # diff
  secret:
    mongodb_uri:
      username: admin
      password: password
  ingress:
    enabled: false
frontend:
  ingress:
    enabled: false
database: # diff
  enabled: true # diff
tags: # diff
  api: true # diff
ingress:
  hosts:
    - host:
        domain: frontend.minikube.local
        chart: frontend
    - host:
        domain: backend.minikube.local
        chart: backend

```

All conditions and tags are true by default, the backend enabled condition, the database enabled condition, and the api tag. 

So using helm install guestbook would install the full application with the three subcharts. 

Change directory to `./chart`

```bash
helm install dev todos
```

But if we need to install a partial todos application, we can do it by setting the conditions to false for the backend and for the database. 

```bash
helm uninstall dev
```

```bash
helm install dev todos --set backend.enabled=false --set database.enabled=false
```

```bash
kubectl get pods
NAME                            READY   STATUS    RESTARTS   AGE
dev-frontend-7b6d795bbc-z8x25   1/1     Running   0          52s
```

Look, this time, only the frontend has been installed. Here, this was done by setting conditions, but the same result can be achieved with a single tag. 

First, edit the `values.yaml` file. 

Update `./chart/todos/values.yaml`

```diff
backend:
- enabled: true
  secret:
    mongodb_uri:
      username: admin
      password: password
  ingress:
    enabled: false
frontend:
  ingress:
    enabled: false
-database:
- enabled: true
tags:
  api: true
ingress:
  hosts:
    - host:
        domain: frontend.minikube.local
        chart: frontend
    - host:
        domain: backend.minikube.local
        chart: backend

```

I'll erase the properties evaluated for conditions because the conditions would override tag.
Let's delete the release and run helm install while setting the tag api to false. 

```bash
helm uninstall dev
```

```bash
helm install dev todos --set tags.api=false
```

```bash
kubectl get pods
NAME                            READY   STATUS    RESTARTS   AGE
dev-frontend-7b6d795bbc-59hvr   1/1     Running   0          6s
```

That command achieves the same partial installation. It installs only the front end. We have now mastered Helm dependencies and are ready to provide many charts reusing their existing charts.
