# Building Umbrella Chart

> We start from `./02-building-helm-charts/02-building-helm-chart`

We have to create one chart for frontend another one for the backend and for last one for the database. Then those three charts are embedded into a wrapping guestbook chart. This can be done by moving them to the charts subdirectory. That kind of chart is commonly named an umbrella chart. 

Create the following directory structure:

```
app/
chart/todos/
├─ Chart.yaml
├─ charts/
|  ├─ backend/
|  |   ├─ templates/
|  |   |  ├─ backend-secret.yaml
|  |   |  ├─ backend-service.yaml
|  |   |  ├─ backend.yaml 
|  |   ├─ Chart.yaml
|  ├─ database/
|  |   ├─ templates/
|  |   |  ├─ mongodb-persistent-volume-claim.yaml
|  |   |  ├─ mongodb-persistent-volume.yaml
|  |   |  ├─ mongodb-secret.yaml
|  |   |  ├─ mongodb-service.yaml
|  |   |  ├─ mongodb.yaml 
|  |   ├─ Chart.yaml
|  ├─ frontend/
|     ├─ templates/
|     |  ├─ frontend-configmap.yaml
|     |  ├─ frontend-service.yaml
|     |  ├─ frontend.yaml
|     |  ├─ ingress.yaml 
|     ├─ Chart.yaml
yaml/
```

Create `./chart/todos/Chart.yaml`

```yaml
apiVersion: v2
name: todos
appVersion: "2.0"
description: A Helm chart for Todos Awesome App 1.1
version: 1.1.0
type: application
```

Notice that we're changing now the `chart`, so we are updating version, previously we were on `0.1.0`

From root solution run:

```bash 
mkdir -p chart/todos/charts/backend/templates
mkdir -p chart/todos/charts/database/templates
mkdir -p chart/todos/charts/frontend/templates
```

```bash
cp -r ./yaml/frontend*.yaml ./chart/todos/charts/frontend/templates
cp ./yaml/ingress.yaml ./chart/todos/charts/frontend/templates
cp -r ./yaml/backend*.yaml ./chart/todos/charts/backend/templates
cp -r ./yaml/mongo*.yaml ./chart/todos/charts/database/templates
```

Now for each `chart` on the umbrella `chart`, we add a new `Chart.yaml`, with the metadata that describes the `chart`.

Create `./chart/todos/charts/backend/Chart.yaml`

```yaml
apiVersion: v2
name: backend
appVersion: "1.0"
description: A Helm chart for Todos backend 1.0
version: 0.1.0
type: application
```

Create `./chart/todos/charts/database/Chart.yaml`

```yaml
apiVersion: v2
name: database
appVersion: "4.4.7"
description: A Helm chart Todos Database Mongodb 4.4.7
version: 0.1.0
type: application
```

Create `./chart/todos/charts/frontend/Chart.yaml`

```yaml
apiVersion: v2
name: frontend
appVersion: "2.0"
description: A Helm chart for Todos Frontend 2.0
version: 1.1.0
type: application
```

Ok, with this we're ready to install/upgrade our umbrella chart. Change your current directory to `chart`.

Run `helm list --short` to see what is currently running. If the application is currently running we can simply run 

```bash
helm upgrade demo todos
```

If we have already clean al the resources we can run 

```bash
helm install demo todos
```

To see if everything is running as we expected, we can run:

```bash
helm get manifest demo | less
```

To clean the resources we can go ahead and run: 

```bash 
$ helm uninstall demo
```