## Demo: Managing Dependencies

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

We are going to build the umbrella chart. However, this time instead of copying the subcharts to the charts folder, we will use Helm dependencies. 

First, we have to configure Helm to use the new `ChartMuseum` repository. 

Change directory to `./chart`

> To clean repo: helm repo remove chartmeseum

```bash
helm repo add chartmuseum http://localhost:8080
"chartmuseum" has been added to your repositories
```

```bash
helm repo list
NAME            URL                          
stable          https://charts.helm.sh/stable
chartmuseum     http://localhost:8080
```

```bash
helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "chartmuseum" chart repository
...Successfully got an update from the "stable" chart repository
Update Complete. ⎈Happy Helming!⎈
```

This can be achieved by running `helm repo add command` and **passing the repository name**, `chartmuseum`, and the URL of the local ChartMuseum repository. Then, we run `helm repo list` to check that the repository is available and `helm repo update` to get the latest Helm chart information from the repository. 

Let's check which charts are available inside the ChartMuseum repository. 

```bash
helm search repo chartmuseum/
NAME                    CHART VERSION   APP VERSION     DESCRIPTION                              
chartmuseum/backend     0.1.0           1.0             A Helm chart for Todos backend 1.0       
chartmuseum/database    0.1.0           4.4.7           A Helm chart Todos Database Mongodb 4.4.7
chartmuseum/frontend    1.1.0           2.0             A Helm chart for Todos Frontend 2.0   
```

Great. The `backend`, `frontend`, and `database` charts are available. Now the dependencies have to be defined. So We go up one directory to where the umbrella todos chart is located and edit the `Chart.yaml` file. 

Update `chart/todos/Chart.yaml`

```yaml
apiVersion: v2
name: todos
appVersion: "2.0"
description: A Helm chart for Todos Awesome App 1.1
version: 1.1.0
type: application
# diff
dependencies:
  - name: backend
    version: ~0.1.0
    repository: http://localhost:8080
  - name: frontend
    version: ^1.1.0
    repository: http://localhost:8080
  - name: database
    version: ~0.1.0
    repository: http://localhost:8080
# diff
```

Inside that file, we define the dependencies. For each subchart, we include the name of the chart, its range of compatible versions, and the repository where it's located. All charts are published on the `localhost` server at port 8080. 

Change directory to `./chart`

```bash
helm dependency update todos
```

We get similar to:

```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "chartmuseum" chart repository
...Successfully got an update from the "grafana" chart repository
...Successfully got an update from the "prometheus-community" chart repository
...Successfully got an update from the "stable" chart repository
...Successfully got an update from the "bitnami" chart repository
Update Complete. ⎈Happy Helming!⎈
Saving 3 charts
Downloading backend from repo http://localhost:8080
Downloading frontend from repo http://localhost:8080
Downloading database from repo http://localhost:8080
Deleting outdated charts
```

We save that file and run `helm dependency update` on the todos chart. 

Helm first connects to the repository to get the latest chart definitions and then downloads the subchart archives that are defined in the dependencies from the repository to the charts directory. We can check this. 

The charts folder was empty, and now it contains the archives of the three dependencies. 

Change diretory to `./chart` 

```bash
ls todos/templates/
NOTES.txt       ingress.yaml
```

And the templates directory only contains the `ingress.yaml` and `NOTES.txt` file. 

We can also list all current dependencies with `helm dependency list todos`. 

```bash
helm dependency list todos
```

We get something similar to this:

```
NAME            VERSION REPOSITORY              STATUS
backend         ~0.1.0  http://localhost:8080   ok    
frontend        ^1.1.0  http://localhost:8080   ok    
database        ~0.1.0  http://localhost:8080   ok 
```

A detailed view of the dependencies with the version range, and the repository URL is displayed, and their status is ok. 

Finally, we are ready to install a new development release of the guestbook application, but this time with a number of charts which uses Helm dependencies rather than subfolders. 

> Uninstall current dependencies

```bash
helm list --short 
```

```bash
helm uninstall <chart name>
```

```bash
helm install dev todos
```

We get something similar to this:

```
NAME: dev
LAST DEPLOYED: Sun Oct 17 12:54:05 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Congratulations ! You installed todos chart successfully.
Release name is dev

You can access the Todos application at the following urls:
  http://dev.frontend.minikube.local
  http://dev.backend.minikube.local
Have fun !
```

As you can see, the chart is installed. 

```bash
helm list
```

We get something similar to this:

```
NAME    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART           APP VERSION
dev     default         1               2021-10-17 12:54:05.67044291 +0200 CEST deployed        todos-1.1.0     2.0  
```


```bash
kubectl get pods
```

We get something similar to this:

```
NAME                            READY   STATUS    RESTARTS   AGE
dev-backend-5f657cdc75-dzpds    1/1     Running   1          92s
dev-database-5b485bd6bb-rhl5b   1/1     Running   0          92s
dev-frontend-7b6d795bbc-2k8f7   1/1     Running   0          92s
```

```bash
helm get manifest dev
```

We can check with `helm list`, `kubectl`, or `helm get manifest` commands. The result is the same as before. 

The only difference is that this time, we have used subcharts publishing the repository as dependencies, and they could easily do the same for other projects. 

Okay, let's delete that release for the next demo. 

```bash
helm uninstall dev
```

If we look at the content of the chart, we see that a `Chart.lock` file has been created. Let's view that file. 

```yaml
dependencies:
- name: backend
  repository: http://localhost:8080
  version: 0.1.0
- name: frontend
  repository: http://localhost:8080
  version: 1.1.0
- name: database
  repository: http://localhost:8080
  version: 0.1.0
digest: sha256:32118490d3fcee3fd93853ce2d9fe0ca0a10c9ed2a35598567f526ea62e73bf7
generated: "2021-10-17T12:40:40.608405606+02:00"
```

Well, it's the same as the `Chart.yaml` file, except that it contains fixed version numbers instead of ranges of versions. Now let's imagine that the Dev team has released a new version of the front end, and a patch chart is packed and published in the local repository. But we might not want to run `helm dependency update` because it could break the guestbook application if the new subchart is not compatible. 

```bash
helm dependency build todos
```

Instead, we can run `helm dependency build todos`, build instead of update, which is based on this `Chart.lock` file with fixed version numbers for all subcharts.

Now we can install with the fixed versions as follows:

```bash
helm install dev todos
```
