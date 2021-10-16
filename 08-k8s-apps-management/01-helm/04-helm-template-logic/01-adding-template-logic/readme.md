# Adding Template Logic

> Start from: `03-customizing-helm-charts/03-customizing-frontend-chart-values`

In this demo, Globomantics DevOps upgrade and improve the chart with some functions. When first looking at the backend deployment template, you'll notice that the name of the `Release.Name` of the chart is used in many places. 

Open `lab8_helm_template_final/chart/guestbook/charts/backend/templates/backend.yaml`

```yaml
# lab8_helm_template_final/chart/guestbook/charts/backend/templates/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-{{ .Chart.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-{{ .Chart.Name }}
    spec:
      containers:
      - name: {{ .Release.Name }}-{{ .Chart.Name }}
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
        imagePullPolicy: Always
        ports:
        - name: {{ .Release.Name }}-{{ .Chart.Name }}
          containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: {{ .Release.Name }}-{{ .Chart.Name }}-secret
              key: mongodb-uri

```


If it has to change, that means you have to change it everywhere. It would be better to externalize it. So first, DevOps create an `_helpers.tpl` file inside the templates directory. They open that file, copy the code snippet, and embed it in a define directive with a name. 

Create `chart/guestbook/charts/backend/templates/_helpers.tpl`

```tpl
{{- define "backend.fullname" -}}
{{ .Release.Name }}-{{ .Chart.Name }}
{{- end -}}
```

Keep in mind that this name is global to the parent chart and all sub‑charts, so, to avoid any conflict, they prefix the name with the name of the chart (`backend`). Then, that code snippet can be included in the templates by substituting it with the include directive, which takes two arguments, the function name and the scope. 

Edit `lab8_helm_template_final/chart/guestbook/charts/backend/templates/backend.yaml`

```diff
apiVersion: apps/v1
kind: Deployment
metadata:
- name: {{ .Release.Name }}-{{ .Chart.Name }}
+ name: {{ include "backend.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
-     app: {{ include "backend.fullname" . }}
+     app: {{ include "backend.fullname" . }}
  template:
    metadata:
      labels:
-       app: {{ .Release.Name }}-{{ .Chart.Name }}
+       app: {{ include "backend.fullname" . }}
    spec:
      containers:
-     - name: {{ .Release.Name }}-{{ .Chart.Name }}
+     - name: {{ include "backend.fullname" . }}
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
        imagePullPolicy: Always
        ports:
-       - name: {{ .Release.Name }}-{{ .Chart.Name }}
+       - name: {{ include "backend.fullname" . }}
          containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
-             name: {{ .Release.Name }}-{{ .Chart.Name }}-secret
+             name: {{ include "backend.fullname" . }}-secret
              key: mongodb-uri

```

Now DevOps can freely change the content of the function and the new implementation is automatically going to be used in the templates. For example, they can add an if/else directive to allow the user to override the fullname in the values.yaml file. 

And they also choose to use the printf formatting function with two arguments. The result is transformed with two pipes, 1 to truncate the fullname if it's larger than 63 characters, and 1 to trim the dash if the truncated name finishes with the dash. 

Edit `chart/guestbook/charts/backend/templates/_helpers.tpl`

```tpl
{{- define "backend.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
```

This complex logic can now be reused in all the other backend templates. We substitute the include directive in the `service.yaml`: 

Update `lab8_helm_template_final/chart/guestbook/charts/backend/templates/backend-service.yaml`

```diff
apiVersion: v1
kind: Service
metadata:
  labels:
-   name: {{ .Release.Name }}-{{ .Chart.Name }}
+   name: {{ include "backend.fullname" . }}
- name: {{ .Release.Name }}-{{ .Chart.Name }}
+ name: {{ include "backend.fullname" . }}
spec:
  selector:
-   app: {{ .Release.Name }}-{{ .Chart.Name }}
+   app: {{ include "backend.fullname" . }}
  ports:
  - protocol: TCP
    port: {{ .Values.service.port }}
    targetPort: 3000
  type: {{ .Values.service.type }}

```

In the ingress: 

```diff
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
- name: {{ .Release.Name }}-{{ .Chart.Name }}-ingress
+ name: {{ include "backend.fullname" . }}-ingress
spec:
  rules:
  - host: {{ .Values.ingress.host }}
    http:
      paths:
      - path: /
        backend:
-         serviceName: {{ .Release.Name }}-{{ .Chart.Name }}
+         serviceName: {{ include "backend.fullname" . }}
          servicePort: 80

```

And in the secret: 

```diff
apiVersion: v1
kind: Secret
metadata:
- name: {{ .Release.Name }}-{{ .Chart.Name }}-secret
+ name: {{ include "backend.fullname" . }}-secret
data:
  mongodb-uri: {{ .Values.secret.mongodb_uri }}


```

Now let's come back to the bug we had in the last demo. The backend cannot access the database because the database services name now depends on the release name, and if we look at the decoded MongoDB URI, it looks like this.

Open `lab8_helm_template_final/chart/guestbook/charts/backend/values.yaml`

```yaml
secret:
  mongodb_uri: bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvZ3Vlc3Rib29rP2F1dGhTb3VyY2U9YWRtaW4=
  #              "mongodb://admin:password@mongodb:27017/guestbook?authSource=admin"
image:
```

The host name is hard‑coded `@mongodb`. Globomantics DevOps are going to solve this issue by dynamically building this URI with the release name. 

First, they split the URI data into a username, a password, a chart name used to define the host, and a port and a database connection string. 

Update `lab8_helm_template_final/chart/guestbook/charts/backend/values.yaml`

```diff
secret:
- mongodb_uri: bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvZ3Vlc3Rib29rP2F1dGhTb3VyY2U9YWRtaW4=
  #              "mongodb://admin:password@mongodb:27017/guestbook?authSource=admin"
+ mongodb_uri:
+   username: your_db_username
+   password: your_db_password
+   dbchart: database
+   dbport: 27017
+   dbconn: "guestbook?authSource=admin"
image: 
  repository: jaimesalas/backend
  tag: "2.0"
replicaCount: 1
service:
  type: ClusterIP
  port: 80
ingress:
  host: backend.minikube.local

```

Then, instead of using hard‑coded string, they build it dynamically in the `secret.yaml` file. 

Update `lab8_helm_template_final/chart/guestbook/charts/backend/templates/backend-secret.yaml`


```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "backend.fullname" . }}-secret
data:
  # mongodb-uri: {{ .Values.secret.mongodb_uri }} # Remove!!
  mongodb-uri: {{ with .Values.secret.mongodb_uri -}}
  {{- list "mongodb://" .username ":" .password "@" $.Release.Name "-" .dbchart ":" .port "/" .dbconn | join "" | b64enc | quote }}
               {{- end}}

```

They restrict the scope to the MongoDB URI object with a with directive. Then they list the items needed to build the URI, the protocol, the username, and the password coming from the values file, followed by the host name, but now the host name is dynamically built from the release name and the chart name database. Finally, the port and the database connection string. All those strings are joined with the join pipeline, and that string is encoded in base64 and put in quotes as is required for Kubernetes secret files. 

This implementation might not be the best, but it gives an example of the with function and some pipelines. It uses the list function and the join pipeline to construct a string. Quite a nice complete example. 

Note that the `username` and` password` are useful here if the backend chart is used as a standalone chart. **But here the backend and database are part of a umbrella chart, so it is more convenient to define them in the top chart value file**. 

```yaml
# lab8_helm_template_final/chart/guestbook/charts/backend/values.yaml
secret:
  # mongodb_uri: bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQG1vbmdvZGI6MjcwMTcvZ3Vlc3Rib29rP2F1dGhTb3VyY2U9YWRtaW4=
  #              "mongodb://admin:password@mongodb:27017/guestbook?authSource=admin"
  mongodb_uri:
    username: your_db_username
    password: your_db_password
    dbchart: database
    dbport: 27017
    dbconn: "guestbook?authSource=admin"
```


Look at how Globomantics DevOps override those default values. 

Create `lab8_helm_template_final/chart/guestbook/values.yaml`

```yaml
backend:
  secret:
    mongodb_uri:
      username: your_db_username
      password: your_db_password
```

They go in the top chart `values.yaml` file, they create a backend property, and as a child of this property, they copy the block with the secret property object. **That way they can override the username and password from the parent chart**. 

>This is a common practice when you reuse existing charts from the Helm repository. 

Now the bug should be fixed. First, a quick helm template guestbook to check whether everything is okay. 

`cd lab8_helm_template_final/chart`

```bash
helm template guestbook | less
```

We see that the fullname is built from the release and chart's names, as before, but this time by the helper function. We have the MongoDB URI string built and encoded. And all the other manifests are the same. 

```yaml
# ....
---
# Source: guestbook/charts/backend/templates/backend-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  # name: RELEASE-NAME-backend-secret
  name: RELEASE-NAME-backend-secret
data:
  # mongodb-uri: map[dbchart:database dbconn:guestbook?authSource=admin dbport:27017 password:password username:admin]
  mongodb-uri: "bW9uZ29kYjovL2FkbWluOnBhc3N3b3JkQFJFTEVBU0UtTkFNRS1kYXRhYmFzZTovZ3Vlc3Rib29rP2F1dGhTb3VyY2U9YWRtaW4="
---
# Source: guestbook/charts/database/templates/mongodb-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: RELEASE-NAME-database-secret
data:
  mongodb-username: YWRtaW4=
  mongodb-password: cGFzc3dvcmQ=
---
# ....
```

Now we can have upgrade the release with helm upgrade, name of the release, name of the chart to fix the bug. 

```bash
helm list --short
```

```bash
helm upgrade demo guestbook
```

Or, if we don't have the `chart

```bash
helm install demo guestbook
```


Let's check that the pods are running and open the default browser to test the application. Everything seems to be okay. We can leave some messages and they are stored in the database by the backend. Globomantics DevOps are excited. They can reuse their charts for a frontend, a backend API, or a database in other applications. If you want to test this yourself, all the files are in my GitHub repository. Start with the lab 8 begin folder and the solution is in the lab 8 final folder.

