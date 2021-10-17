## Demo: Packaging and Publishing Charts


> Start from: `04-helm-template-logic/02-installing-dev-and-test`

We want to make it easier to reuse our charts in other projects. So we are going to pack them into archives and publish them in a repository. Then, we will modify the umbrella chart so that it depends on the three subcharts published in the repository. Let's do it. 

Change diretory to `chart`

```bash
cp -R todos/charts dist
ls dist
```

We get 

```
backend         database        frontend
```

Run

```bash
cd dist
```

```bash
helm package frontend backend database
```

We get 

```
Successfully packaged chart and saved it to: /home/lemoncode/Documents/trainings/k8s-fundamentals/08-k8s-apps-management/01-helm/05-managing-dependencies/01-packaging-and-publishing-charts/chart/dist/frontend-1.1.0.tgz
Successfully packaged chart and saved it to: /home/lemoncode/Documents/trainings/k8s-fundamentals/08-k8s-apps-management/01-helm/05-managing-dependencies/01-packaging-and-publishing-charts/chart/dist/backend-0.1.0.tgz
Successfully packaged chart and saved it to: /home/lemoncode/Documents/trainings/k8s-fundamentals/08-k8s-apps-management/01-helm/05-managing-dependencies/01-packaging-and-publishing-charts/chart/dist/database-0.1.0.tgz
```


First, we moved the subcharts to a dist directory. So there was no chart in the charts subdirectory yet. Then, we went in the dist directory, which contains the unpacked content of the charts, back end, database, and front end and run `helm package` on those three subcharts. That command created three archives that are ready to be uploaded to a repository. 

But before doing so, those charts archives must be defined in an `index.yaml` file. 

From `chart/dist` as root

```bash
helm repo index .
```

That file can be generated in the folder containing the archives by using the `helm repo index command`. 

Open `chart/dist/index.yaml`

```yaml
apiVersion: v1
entries:
  backend:
  - apiVersion: v2
    appVersion: "1.0"
    created: "2021-10-17T10:59:59.535257006+02:00"
    description: A Helm chart for Todos backend 1.0
    digest: 68433892715fbc59c1934b595223983176449e172ca5156a332815977fe0da9c
    name: backend
    type: application
    urls:
    - backend-0.1.0.tgz
    version: 0.1.0
  database:
  - apiVersion: v2
    appVersion: 4.4.7
    created: "2021-10-17T10:59:59.535440128+02:00"
    description: A Helm chart Todos Database Mongodb 4.4.7
    digest: e315ed01753699d30f4e906d0a8f53aabcd3a17f77eb78ab4eef161adbc7c5c7
    name: database
    type: application
    urls:
    - database-0.1.0.tgz
    version: 0.1.0
  frontend:
  - apiVersion: v2
    appVersion: "2.0"
    created: "2021-10-17T10:59:59.535618515+02:00"
    description: A Helm chart for Todos Frontend 2.0
    digest: f187916aed0c0a4f956f67d550202159283b8abb65bba09d5eb666a8af610ab3
    name: frontend
    type: application
    urls:
    - frontend-1.1.0.tgz
    version: 1.1.0
generated: "2021-10-17T10:59:59.534891279+02:00"

```

If we look at it, we can see some entries describing the packed charts. Now they are ready to upload the archives and the index file to an HTTP server. 

They decide to install ChartMuseum Server. ChartMuseum is an HTTP server that is a dedicated Helm repository with a nice API. First, they download ChartMuseum binary. 

You can find the link in the [GitHub ChartMuseum project](). Make it executable and save it to the local bin folder. ChartMuseum needs a storage location for the repository. 

Create on root `./helm/repo` and `cd ./`, after run:

```bash
docker run --rm -it \
  -p 8080:8080 \
  -e DEBUG=1 \
  -e STORAGE=local \
  -e STORAGE_LOCAL_ROOTDIR=/charts \
  -v $(pwd)/helm/repo:/charts \
  ghcr.io/helm/chartmuseum:v0.13.1
```

For this demo, it will be stored locally in the home directory, `helm/repo`. Then, ChartMuseum can be started with the following parameters to use the local storage. It runs and listens on port 8080. For the demo, we'll leave this window open. 

```
Unable to find image 'ghcr.io/helm/chartmuseum:v0.13.1' locally
v0.13.1: Pulling from helm/chartmuseum
ba3557a56b15: Pull complete 
efcac14f1459: Pull complete 
ad11a65c05ef: Pull complete 
Digest: sha256:79350ffbf8b0c205cf8b45988de899db594618b24fefd17cdbcdbbc8eb795d72
Status: Downloaded newer image for ghcr.io/helm/chartmuseum:v0.13.1
2021-10-10T09:38:24.143Z        DEBUG   Fetching chart list from storage        {"repo": ""}
2021-10-10T09:38:24.145Z        DEBUG   No change detected between cache and storage    {"repo": ""}
2021-10-10T09:38:24.145Z        INFO    Starting ChartMuseum    {"host": "0.0.0.0", "port": 8080}
2021-10-10T09:38:24.145Z        DEBUG   Starting internal event listener
```

Finally, in another window, the repository can be populated by just copying the chart archives to the local storage. You could also upload them with HTTP upload request to the ChartMuseum API. 

* Copy `./lab_10_helm_dependencies_begin/chart/dist` to `./helm/repo`. `cd` into `./lab_10_helm_dependencies_begin/chart/dist` and run:

```bash
cp *.tgz ../../../helm/repo
```

And now, let's make an HTTP request to ChartMuseum to get the list of charts. 

```bash
curl http://localhost:8080/api/charts | jq .
```

We can see that the charts have been published. 

```json
{
  "backend": [
    {
      "name": "backend",
      "version": "0.1.0",
      "description": "A Helm chart for Guestbook backend 1.0",
      "apiVersion": "v2",
      "appVersion": "1.0",
      "type": "application",
      "urls": [
        "charts/backend-0.1.0.tgz"
      ],
      "created": "2021-10-10T09:44:31.982586322Z",
      "digest": "81865c2f12de3ed71da0ba0d68a3feab7bba3bf29b796fcd0d3dd5001ab66a9e"
    }
  ],
  "database": [
    {
      "name": "database",
      "version": "0.1.0",
      "description": "A Helm chart for Guestbook Database Mongodb 3.6",
      "apiVersion": "v2",
      "appVersion": "3.6",
      "type": "application",
      "urls": [
        "charts/database-0.1.0.tgz"
      ],
      "created": "2021-10-10T09:44:31.983426634Z",
      "digest": "abd1e89f0ecec45f406f42f4df3a3321af729399bc5cf4a14cfcf0a39dcb1570"
    }
  ],
  "frontend": [
    {
      "name": "frontend",
      "version": "1.1.0",
      "description": "A Helm chart for Guestbook Frontend 2.0",
      "apiVersion": "v2",
      "appVersion": "2.0",
      "type": "application",
      "urls": [
        "charts/frontend-1.1.0.tgz"
      ],
      "created": "2021-10-10T09:44:31.984445467Z",
      "digest": "f980985ad82c7f63a17e71df3305885f94ffc81b2c70bd457ca8e31d40cda684"
    }
  ]
}
```

In your own projects, you'll set up and use a cloned Helm repository or use an existing one. But in this demo, you have learned how to do it yourself locally with ChartMuseum. It's a good way to understand how the process works. Great. Globomantics DevOps have packed and published their charts to a local repository. Now they can build the umbrella chart, as well as any other charts with dependencies to the charts available in the repository. If you want to run this lab, all the files are in my GitHub repository. Start with the lab_10 begin folder, and the solution is in the lab_10 final folder.

  database:
  - apiVersion: v2
    appVersion: "3.6"
    created: "2021-10-10T11:10:13.699569+02:00"
    description: A Helm chart for Guestbook Database Mongodb 3.6
    digest: abd1e89f0ecec45f406f42f4df3a3321af729399bc5cf4a14cfcf0a39dcb1570
    name: database
    type: application
    urls:
    - database-0.1.0.tgz
    version: 0.1.0
  frontend:
  - apiVersion: v2
    appVersion: "2.0"
    created: "2021-10-10T11:10:13.700632+02:00"
    description: A Helm chart for Guestbook Frontend 2.0
    digest: f980985ad82c7f63a17e71df3305885f94ffc81b2c70bd457ca8e31d40cda684
    name: frontend
    type: application
    urls:
    - frontend-1.1.0.tgz
    version: 1.1.0
generated: "2021-10-10T11:10:13.694707+02:00"

```

If we look at it, we can see some entries describing the packed charts. Now we are ready to upload the archives and the index file to an HTTP server. 

We've decided to install ChartMuseum Server. ChartMuseum is an HTTP server that is a dedicated Helm repository with a nice API. 

First, we download ChartMuseum binary. 

You can find the link in the [GitHub ChartMuseum project](https://github.com/helm/chartmuseum). Make it executable and save it to the local bin folder. ChartMuseum needs a storage location for the repository. 

Create on a new diretory `./helm/repo` and `cd ./`, after run:

```bash
docker run --rm -it \
  -p 8080:8080 \
  -e DEBUG=1 \
  -e STORAGE=local \
  -e STORAGE_LOCAL_ROOTDIR=/charts \
  -v $(pwd)/helm/repo:/charts \
  ghcr.io/helm/chartmuseum:v0.13.1
```

For this demo, it will be stored locally in the home directory, `helm/repo`. Then, ChartMuseum can be started with the following parameters to use the local storage. It runs and listens on port 8080. For the demo, we'll leave this window open. 

```
Unable to find image 'ghcr.io/helm/chartmuseum:v0.13.1' locally
v0.13.1: Pulling from helm/chartmuseum
ba3557a56b15: Pull complete 
efcac14f1459: Pull complete 
ad11a65c05ef: Pull complete 
Digest: sha256:79350ffbf8b0c205cf8b45988de899db594618b24fefd17cdbcdbbc8eb795d72
Status: Downloaded newer image for ghcr.io/helm/chartmuseum:v0.13.1
2021-10-10T09:38:24.143Z        DEBUG   Fetching chart list from storage        {"repo": ""}
2021-10-10T09:38:24.145Z        DEBUG   No change detected between cache and storage    {"repo": ""}
2021-10-10T09:38:24.145Z        INFO    Starting ChartMuseum    {"host": "0.0.0.0", "port": 8080}
2021-10-10T09:38:24.145Z        DEBUG   Starting internal event listener
```

Finally, in another window, the repository can be populated by just copying the chart archives to the local storage. You could also upload them with HTTP upload request to the ChartMuseum API. 

* Copy `./chart/dist` to `./helm/repo`. `cd` into `./chart/dist` and run:

```bash
cp *.tgz ../../../helm/repo
```

And now, let's make an HTTP request to ChartMuseum to get the list of charts. 

```bash
curl http://localhost:8080/api/charts | jq .
```

We can see that the charts have been published. 

```json
{
  "backend": [
    {
      "name": "backend",
      "version": "0.1.0",
      "description": "A Helm chart for Todos backend 1.0",
      "apiVersion": "v2",
      "appVersion": "1.0",
      "type": "application",
      "urls": [
        "charts/backend-0.1.0.tgz"
      ],
      "created": "2021-10-17T09:24:11.435831451Z",
      "digest": "68433892715fbc59c1934b595223983176449e172ca5156a332815977fe0da9c"
    }
  ],
  "database": [
    {
      "name": "database",
      "version": "0.1.0",
      "description": "A Helm chart Todos Database Mongodb 4.4.7",
      "apiVersion": "v2",
      "appVersion": "4.4.7",
      "type": "application",
      "urls": [
        "charts/database-0.1.0.tgz"
      ],
      "created": "2021-10-17T09:24:11.47183084Z",
      "digest": "e315ed01753699d30f4e906d0a8f53aabcd3a17f77eb78ab4eef161adbc7c5c7"
    }
  ],
  "frontend": [
    {
      "name": "frontend",
      "version": "1.1.0",
      "description": "A Helm chart for Todos Frontend 2.0",
      "apiVersion": "v2",
      "appVersion": "2.0",
      "type": "application",
      "urls": [
        "charts/frontend-1.1.0.tgz"
      ],
      "created": "2021-10-17T09:24:11.499830365Z",
      "digest": "f187916aed0c0a4f956f67d550202159283b8abb65bba09d5eb666a8af610ab3"
    }
  ]
}
```

In our own projects, we'll set up and use a cloned Helm repository or use an existing one. But here, we have learned how to do it ourselves locally with ChartMuseum. 