# Adding Logic To Helm Templates

### Agenda

* Using functions & Pipelines
* Modifying Scope using `with`
* Controlling whitespace & identation
* Flow control (condition & loops)
* Using variables
* Calling Helper functions & Sub-templates

## Using Functions and Pipelines

Two different syntax to run simple logic in our templates

* **Function** - `quote value`
    - Analogy: `quote(value)`

* **Pipeline** - `value | quote`
    - ==> value | ==> quote ==>

Both functions and pipelines can be used with more than one argument. 

* **Function** - `default default_value value`
    - Analogy: `default(default_value, value)`

* **Pipeline** - `value | default default_value`
    - ==> value | ==> default default_value ==>

The advantage of pipelines over functions is that they can be changed easily.

For example

```yaml
# Template
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: {{ .Values.service.name | default.Chart.Name }}
```

It generates a default value if the value, `.Values.service.name`, does not exist.

### Functions and Pipelines

> You cannot build your own custom template function. This is a limitation of Helm.

* [Go text/template package](http://golang.org/pkg/text/template/)

* [Sprig functions project](http://masterminds.github.io/sprig/)

* [Helm project](http://helm.sh)

* No Go custom functions support (user helper functions)

Here are the main functions available in Helm templates. 

|          Function           |            Pipeline            |
| :-------------------------: | :----------------------------: |
| default default_value value | value \| default default_value |
|         quote value         |         value \| quote         |
|         upper value         |         value \| upper         |
|       trunc value 63        |       value \| trunc 63        |
|    trimSuffix "-" value     |    value \| trimSuffix "-"     |
|        b64enc value         |        value \| b64enc         |
|       randAlphaNum 10       |    value \| randAlphaNum 10    |
|        toYaml value         |        value \| toYaml         |
|   printf format value ...   |   list value ... \| join "-"   |

## Modifying Scope with "With"

Values are organized in a nested way. Sometimes you may want work with a subset of the values without repeating the complete path from the root to the value every time. 

Without specifying the scope our template looks like this.

```yaml
# Template
spec:
  type: {{.Values.service.type}}
  ports: 
    - port: {{.Values.service.port}}
      targetPort: 80
```

```yaml
# Values
service:
  type: ClusterIP
  port: 80
```


```yaml
spec:
  type: ClusterIP
  ports: 
    - port: 80
      tragetPort: 80
```

By defining the scope with the with function, we can restrict the scope to the service property:

```yaml
# Template
spec:
  {{ with .Values.service }}
  type: {{.type}}
  ports: 
    - port: {{.Values.service.port}}
      targetPort: 80
  {{ end }}
```

```yaml
# Values
service:
  type: ClusterIP
  port: 80
```


```yaml
spec:
  type: ClusterIP
  ports: 
    - port: 80
      tragetPort: 80
```

> The `with` and `end` directives generate additional carriage returns that are found in the manifest file.

## Controlling Space and Indent

### Remove Extra Carriage Returns

This template includes comments to show the `carriage return`

```yaml
# Template
spec:
  {{ with .Values.service }} # Carriage Return
  type: {{.type}}
  ports: 
    - port: {{.Values.service.port}}
      targetPort: 80
  {{ end }} # Carriage Return
```

```yaml
# Values
service:
  type: ClusterIP
  port: 80
```


```yaml
# Carriage Return
spec:
  type: ClusterIP
  ports: 
    - port: 80
      tragetPort: 80
# Carriage Return
```

To solve that issue, we can remove one carriage return with a dash at the beginning of the directive.

```yaml
# Template
spec:
  {{ -with .Values.service }} # Carriage Return
  type: {{.type}}
  ports: 
    - port: {{.Values.service.port}}
      targetPort: 80
  {{ end }} # Carriage Return
```

```yaml
# Values
service:
  type: ClusterIP
  port: 80
```


```yaml
spec:
  type: ClusterIP
  ports: 
    - port: 80
      tragetPort: 80
# Carriage Return
```

> The dash removes all spaces and carriage returns before the directive if it's located at the beginning of the directive and all spaces and carriage returns after the directive if it's placed at the end of the directive. 

Let's consider this second example. 

```yaml
# Template
spec:
  type: {{.type}}
  ports:
    - port:
{{ with .Values.service }} # Carriage Return 
    {{.port}}
{{ end }} # Carriage Return
    targetPort: 80
```

```yaml
# Values
service:
  port: 80
```


```yaml
spec:
  type: ClusterIP
  ports: 
    - port: # Carriage Return
        # Carriage Return 
        80
        # Carriage Return
      tragetPort: 80
```

> Exercise: Insert dashes to generate a valid manifest.

Solution:

```yaml
# Template
spec:
  type: {{.type}}
  ports:
    - port:
{{ -with .Values.service- }} # Carriage Return 
    {{.port}}
{{ -end }} # Carriage Return
    targetPort: 80
```

### Indent by Template

By default, all the indentations from the template are preserved. But if for some reason we want to modify the indentation, we can do it with the **indent function**.

Let's consider this example. Note that the identation is not what we want

```yaml
# template
spec: 
  type: ClusterIP
  ports:
    - port: 80
      tragetPort: 80
{{ .Values.tcp }}
```

```yaml
# values
service:
  port: 80
tcp: "protocol: TCP"
```


```yaml
# Manifest
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 80
protocol: TCP
```

We can use the indent function to align the protocol property with the other properties. 

```yaml
# template
spec: 
  type: ClusterIP
  ports:
    - port: 80
      tragetPort: 80
{{ indent 6 .Values.tcp }}
```

### Formated Output

Some functions are inherited from Go template package. One of them is often used in Helm templates, specifically the `printf function`. It generates a formatted string with some values.

```yaml
# Template
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: {{-printf "%s-%s" .Release.Name .Values.service.name -}}
```

```yaml
# Values
service:
  type: NodePort
  name: myservice
  port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: myrelease-myservice
```

## Logical Operators and Flow Control

The Helm template, also allows you to compare and combine values. 

| Operator     | Function |   Pipeline    |
| ------------ | :------: | :-----------: |
| Equal to     |    eq    | eq.Val1.Val2  |
| Not equal to |    ne    | ne.Val1.Val2  |
| Greater than |    gt    | gt.Val1.Val2  |
| Lower than   |    lt    | lt.Val1.Val2  |
| Or           |    or    | or.Val1.Val2  |
| And          |   and    | and.Val1.Val2 |
| Not          |   not    |   not.Val1    |

In Helm templates, operators are functions.

### Example of Logical Operators

### 1

```
{{- if and .adminEmail (or .serviceAccountJson .exisitingSecret) }}
```

### 2
```
{{- if(and(eq .Values.service.type "NodePort"))(not(empty .Values.service.nfsNodePort))}}
```

### 3
```
{{- if or .Values.rbac.pspEnabled (and .Values.rbac.namespaced (or .Values.sidecar.dashboards.enabled .Values.sidecar.datasources.enabled ))}}
```

## Flow Control

Most of the time, operators are used in conditions.

Here is the syntax of the conditions directive in Helm templates. 

```yaml
# Template
# Chart Ingress
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  labels:
    app.kubernetes.io/name:
{{- if .Values.service.name -}}
{{.Values.service.name | trimSuffix "-"}}
{{- else -}}
{{.Chart.Name}}
{{- end -}}
```

```yaml
# Values
ingress:
  enabled: true
  name: myingress
```

```yaml
# Manifest
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  labels:
    app.kubernetes.io/name: myingress
```

A common method to make some Kubernetes resources optional is to evaluate a property named enabled in an encapsulating if directive:

```yaml
# Template
{{- if Values.ingress.enabled }}
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  labels:
    app.kubernetes.io/name:
{{- if .Values.service.name -}}
{{.Values.service.name | trimSuffix "-"}}
{{- else -}}
{{.Chart.Name}}
{{- end -}}
{{- end -}}
```

### Loops

To loop around the list of values coming from a YAML array, you can use the `range function` terminated by an `end directive`.

```yaml
# Template
apiVersion: extensions/v1beta1
kind: ingress
[...]
spec:
{{-range Value.ingress.hosts}}
 - host: {{.hostname | quote}}
   http: 
     paths:
     {{- range .paths }}
       - path: {{ .path }}
         backend:
           serviceName: {{ .service }}
           servicePort: http
     {{-end }}
{{-end }}
```

```yaml
# values
ingress:
  hosts:
    - hostname: frontend.local
      paths:
        - path: "/public"
          service: "frontend"
        - path: "/admin"
          service: "admin"
    - hostname: backend.local
      paths: []
```

```yaml
# Manifest
apiVersion: extensions/v1beta1
kind: ingress
[...]
spec:
  rules:
   - host: "frontend.local"
     http: 
       paths:
         - path: /public
           backend:
             serviceName: frontend
             servicePort: port
         - path: /admin
           backend:
             serviceName: frontend
             servicePort: port
   - host: "backend.local"
     http:
       paths:  
```

> Note that the scope inside the range is restricted to the values you are iterating on.

How can I access the parent?

## Using Variables

When do you need variables? They are especially useful as a workaround of scope restrictions. Inside a `with` or `range` directive. We cannot access value from the root as shown in this example with `.Values`.

The scope is restricted to inside the `with`, so all references are relative to that scope. 

```yaml
spec:
  {{ with .Values.service }}
  type: {{ .type }}
  ports:
    - port: {{ .port }}
      targetPort: 80
      name: {{ .Values.defaultPortName }} # NO!!!!
  {{ end }}
```

To get around this, we can define a variable before the with or range directive.

```yaml
{{ $defaultPortName := .Values.defaultPortName }}
spec:
  {{ with .Values.service }}
  type: {{ .type }}
  ports:
    - port: {{ .port }}
      targetPort: 80
      name: {{ $defaultPortName }}
  {{ end }}
```

The dollar is called the global variable. It refers to a built‑in variable that allows you to access the root data.

## Calling Helper Function and Sub Templates

Let's imagine that the logic needed to build the label becomes more and more complex.

```yaml
# Template
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kuberenetes.io/name: {{.Values.service.name | trunc 63 | trimSuffix "-"}}
```

Comes to:

```
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
```

We don't want to copy‑paste that big piece of code over and over again in your templates. The way you can reuse code in Helm templates is by using `sub‑templates`, also named `helper functions`.

We place the code into`_helpers.tpl` file and wrapped with a defined function. The defined function takes the name of the sub‑template as argument. 

> The sub‑template names are global, so to guarantee that the name is unique, it's recommended to prefix that name with the name of the chart.

When that sub‑template is defined, you can reuse it anywhere in your chart with an `include` function.

It's stored in templates directory, and is not processed by Helm template because is prefixed with `_`

```
mychart/
  ├─ charts/
  ├─ templates/
  |  ├─ tests/ 
  |  ├─ NOTES.txt 
  |  ├─ _helpers.tpl 
  |  ├─ deployment.yaml
  |  ├─ ingress.yaml
  |  ├─ service.yaml 
  ├─ .helmignore
  ├─ Chart.yaml
  ├─ values.yaml
```

> If you want Helm to completely ignore some files that are in your chart directory, you can add their name with or without wildcards in a `.helmignore` file in the root of your chart.

Imagine that you want to create a chart that contains only sub‑templates like this, a chart that would not create any Kubernetes manifest, rather an abstract chart that only contains functions that could be shared and reused by other charts. That is a `Helm library`

```yaml
# Chart.yaml
apiVersion: v2
name: mylibrary
appVersion: "1.0"
description: A Helm library chart for Guestbook App
version: 1.2.1
type: library
```

### NOTES.txt

Each time a user installs your chart, the content of that file is printed in the console. And, of course, that file is also a template so you can build its content dynamically.

## Demo: Adding Template Logic

[Demo: Adding Template Logic](01-adding-template-logic/readme.md)

## Demo: Installing Dev and Test Releases

[Demo: Installing Dev and Test Releases](02-installing-dev-and-test/readme.md)