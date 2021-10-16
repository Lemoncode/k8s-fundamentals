## Demo: Installing Dev and Test Releases

> Start from: `04-helm-template-logic/01-adding-template-logic`


For now, the hosts mapped in the ingress are defined in the chart's values files. And if we want to install two releases of the same chart, one for the dev and one for the test, we have to change the host in the` values.yaml` file. 

We would like something more flexible where the host name is also dynamically generated from the release name. 

Let's do this. 

### Todos Application: React  + API

The frontend is an application built with React. When the user connects, the page and its JavaScript are downloaded. Then, the page itself calls the backend API with HTTP requests launched by the JavaScript code. 

Those requests also come from the external world, so they also have to be done through the ingress. That's why we have two ingresses, one for the frontend and one for the backend API. 

We will disable the ingress that was defined in the frontend and backend charts. Then, they'll build a new ingress in the umbrella chart. 

To disable the ingress for the backend, we add an if directive. 

Update `chart/todos/charts/backend/templates/ingress.yaml`

```yaml
{{- if .Values.ingress.enabled -}} # diff
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: {{ include "backend.fullname" . }}-ingress
spec:
  rules:
  - host: {{ .Values.ingress.host }}
    http:
      paths:
      - path: /
        backend:
          serviceName: {{ include "backend.fullname" . }}
          servicePort: 80
{{- end }} # diff
```

If the ingress enabled value is true, the content is rendered. This is a common practice in Helm templates to make some features optional. 


Then, in the values.yaml file for the backend, they set that enabled property to true by default.

Update `lab9_helm_template_final/chart/guestbook/charts/backend/values.yaml`

```diff
secret:
  # mongodb_uri: bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvZ3Vlc3Rib29rP2F1dGhTb3VyY2U9YWRtaW4=
  #              "mongodb://admin:password@mongodb:27017/guestbook?authSource=admin"
  mongodb_uri:
    username: your_db_username
    password: your_db_password
    dbchart: database
    dbport: 27017
    dbconn: "guestbook?authSource=admin"
image: 
  repository: jaimesalas/backend
  tag: "2.0"
replicaCount: 1
service:
  type: ClusterIP
  port: 80
ingress:
+ enabled: true
  host: backend.minikube.local

```

Why true? Because that way we get an ingress by default if the chart is used as a standalone. 

They do exactly the same for the frontend; add an if directive and activate the ingress by default for a standalone frontend. 

Update `lab9_helm_template_final/chart/guestbook/charts/frontend/templates/ingress.yaml`

```yaml
{{- if .Values.ingress.enabled -}} # diff
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
spec:
  rules:
  - host: {{ .Values.ingress.host }}
    http:
      paths:
      - path: / 
        backend:
          serviceName: {{ .Release.Name }}-{{ .Chart.Name }}
          servicePort: 80
{{- end }} # diff
```

Update `lab9_helm_template_final/chart/guestbook/charts/frontend/values.yaml`

```diff
config:
  guestbook_name: "My PopRock Festival 2.0"
  backend_uri: "http://backend.minikube.local/guestbook"
replicaCount: 1
image:
  repository: jaimesalas/frontend
  tag: "2.0"
service:
  port: 80
  type: ClusterIP
ingress:
+ enabled: true
  host: frontend.minikube.local
```

But those values are going to be overridden and set to false at the top level in the parent chart to disable the ingress. 

At the top level, in the umbrella chart, we create a templates directory and add an ingress.yaml file.

Create `lab9_helm_template_final/chart/guestbook/templates/ingress.yaml`

Then, we edit the `values.yaml` file of that umbrella chart and first disable the backend ingress by overriding the enabled property:  

Update `lab9_helm_template_final/chart/guestbook/values.yaml`

```diff
backend:
  secret:
    mongodb_uri:
      username: admin
      password: password
+ ingress:
+   enabled: false
```

And then do the same for the frontend ingress:

Update `lab9_helm_template_final/chart/guestbook/values.yaml`

```diff
backend:
  secret:
    mongodb_uri:
      username: admin
      password: password
  ingress:
    enabled: false
+frontend:
+ ingress:
+   enabled: false
```

Then we add an ingress object with two host definitions, one for the frontend, the domain of that host is frontend.minikube.local, and it refers to the frontend chart, and one for backend, accessisble at the domain backend.minikube.local, referring to the backend chart. 

Update `lab9_helm_template_final/chart/guestbook/values.yaml`


```yaml
backend:
  secret:
    mongodb_uri:
      username: admin
      password: password
  ingress:
    enabled: false
frontend:
  ingress:
    enabled: false
# diff
ingress:
  hosts:
    - host:
        domain: frontend.minikube.local
        chart: frontend
    - host:
        domain: backend.minikube.local
        chart: backend
# diff
```

Now, let's build the ingress manifest from that ingress object. 

Update `lab9_helm_template_final/chart/guestbook/templates/ingress.yaml`

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
```

We first set the ingress file definition header with the name built from the release and the chart's names. Note that we could use the frontend helper function because helper functions are global, but it isn't very nice to use children functions in the parent chart. It would be better to use a library chart. 

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
# diff
spec:
  rules:
{{- range .Values.ingress.hosts }}
  - host: {{ $.Release.Name }}.{{ .host.domain }}
    http:
      paths:
      - path: /
        backend:
          serviceName: {{ $.Release.Name }}-{{ .host.chart }}
          servicePort: 80
{{- end }}
# diff
```

Then, we build the ingress rules. We loop on the hosts and build the host name dynamically as the release name followed by a dot and the domain name. As so, our frontend is accessible with a URL that looks like `releasename.frontend.minikube.local`. And the root path request is forwarded to the backend service, so either the frontend service or the backend API service. Both are named according to the release.name‑ name of the chart for a given host. 

By the way, don't confuse here ingress's backend and our backend API. 


Finally, before testing this new chart, let's add a NOTES.txt file to explain to the user which URLs he can access, the application from. 

Create `lab9_helm_template_final/chart/guestbook/templates/NOTES.txt`

```txt
Congratulations ! You installed {{ .Chart.Name }} chart successfully.
Release name is {{ .Release.Name }}

You can access the Guestbook application at the following urls:
{{- range .Values.ingress.hosts }}
  http://{{ $.Release.Name }}.{{ .host.domain }}
{{- end }}
Have fun !

```

This file is part of the templates directory. This is a text file containing some directives, which are also evaluated by the Helm template engine. And the result is displayed at the end of a helm chart install command. 

Update `/etc/hosts`

If you want to run this demo yourself, you first have to configure your DNS and host file so that the dev and test sub‑domains point to the minikube IP. One way to do this is to add mappings for each dev and test release in the hosts file. 

```bash
sudo nano /etc/hosts
```

```
# Added by jaimesalas
# To test minikube Ingress
192.168.64.8 frontend.minikube.local backend.minikube.local 
192.168.64.8 test.frontend.minikube.local dev.frontend.minikube.local 
192.168.64.8 test.backend.minikube.local dev.backend.minikube.local
# End of section
```


Globomantics DevOps are now proud to announce to the dev and test team that they can deploy two independent releases of the same chart, one for dev release and one for test release, and access them separately. 

They first test the template rendering. 

```bash
helm template guestbook | less
```

We can check whether the ingress is dynamically configured by looping through the host values.

```yaml
# ......
---
# Source: guestbook/templates/ingress.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: RELEASE-NAME-guestbook-ingress
spec:
  rules:
  - host: RELEASE-NAME.frontend.minikube.local
    http:
      paths:
      - path: /
        backend:
          serviceName: RELEASE-NAME-frontend
          servicePort: 80
  - host: RELEASE-NAME.backend.minikube.local
    http:
      paths:
      - path: /
        backend:
          serviceName: RELEASE-NAME-backend
          servicePort: 80
```


Okay, ready to install. First, let's delete the previous release with helm uninstall to free some memory in our Kubernetes cluster. 

```bash
helm list --short
```

```bash
helm uninstall demo
```

Then, install a dev release with helm install dev. And to customize it without editing the values.yaml file, we can add a ‑‑set to override the value. Here we override the `guestbook_name` to DEV. 

```bash
helm install dev guestbook --set frontend.config.guestbook_name=DEV
```

Note that we see the result of our NOTES.txt template, which shows us where to access the applications. 

```
Congratulations ! You installed guestbook chart successfully.
Release name is dev

You can access the Guestbook application at the following urls:
  http://dev.frontend.minikube.local
  http://dev.backend.minikube.local
Have fun !
```

Now let's install a test release the same way, overriding the guestbook_name to TEST. 

```bash
helm install test guestbook --set frontend.config.guestbook_name=TEST
```

We can check that all the pods are running, three for the dev release, and three for the test release. 

```
kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
dev-backend-5f657cdc75-xpql7     1/1     Running   1          4m26s
dev-database-5b485bd6bb-ck6hw    1/1     Running   0          4m26s
dev-frontend-7b6d795bbc-lljk4    1/1     Running   0          4m26s
test-backend-65cbfcc47f-skf8c    1/1     Running   1          19s
test-database-74d9599bc-tbcqm    1/1     Running   0          19s
test-frontend-589559b885-bsltx   1/1     Running   0          19s
```

And finally, let's test the dev release at `dev.frontend.minikube.local`. The name of the guestbook is DEV, but if we request `test.frontend.minikube.local`, the name of the guestbook is TEST. 

So we really have two different releases, one for dev and one for test, running in the same Kubernetes cluster and in the same namespace. All names are dynamically built. If you want to test this by yourself, all the files are in my GitHub repository. Start in the lab 9 begin folder and the solutions are in the lab 9 final folder. Note that you will have to build the backend URI dynamically in the frontend chart as we did in lab 8 for the MongoDB URI. I did not show that part in this demo.
