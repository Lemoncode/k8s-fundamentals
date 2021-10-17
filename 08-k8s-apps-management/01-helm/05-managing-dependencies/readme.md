# Managing Dependencies

### Agenda

* Package a chart in a compressed archive.
* Helm repository
* Publish a Chart into Helm repository
* Defining dependencies between charts
* Optional dependencies

## Packaging a Chart

- Compress chart folder in a .tar.gz archive
- Add a version number to the archive

```bash
tar -zcvf chart_name-1.2.0.tgz chart_name
helm package chart_name
```

> Helm chart packages are simple Unix tar gzip compressed archives

## Publishing Charts in Repository

To make a chart available for other projects, you have to publish it in a Helm repository.

> A Helm chart repository is the location where packaged charts can be stored and shared.

It's a HTTP server containing `package chart files` and an `index.yaml`

### Publishing in a Repository

* Create the index.yaml
* Uploads chart's archives and index file to an http server
    - Nginx, Apache, Cloud or user Chartmuseum
* Provenance files

```
helm repo index .
helm package --sign
helm verify chart.tgz
helm install --verify
```

### Helm Repository

How can the Helm client use those charts?

1. Define the repolsitory in the Helm configuration.
2. Define the dependencies.

### Managing a Repository List

* Helm maintains a list of repositories
    - Stable
    - Customs
* Update the list by adding or removing repositories

```bash
helm repo list
```

> A custom repository can be added to the list with the helm repo add command.

```bash
helm repo add myrepo http://myserver.org/charts

helm repo remove myrepo
```

### Default Repository

* No repository by default in Helm 3

* Highly recommended to add stable helm repository

```bash
helm repo add stable https://charts.helm.sh/stable
```

## Demo: Packaging and Publishing Charts

[Demo: Packaging and Publishing Charts](05-managing-dependencies/../01-packaging-and-publishing-charts/readme.md)

## Defining Depndencies

How can we define dependencies between charts? The todos umbrella chart that we built in the demo depends on three subcharts. 

* **guestbook dependencies**
    - frontend
    - backend 
    - database

The way that we have managed dependencies was by copying the unpacked subcharts into the charts directory.

We could also copy the charts as compressed archive in the charts folder. This is a manual way of managing dependencies.

Bear in mind that we'll have to deal with a lot of dependencies between versions.

> We need an automatic way to manage dependencies between charts.

### Chart.yaml

The dependencies can be defined in a `chart.yaml` file.

```yaml
apiVersion: v2
name: foo
appVersion: "2.0"
description: A Helm chart for Foo 2.0
version: 1.2.2
type: application

dependencies:
  - name: backend
    version: ~1.2.2
    repository: http://localhost:8080
  - name: frontend
    version: ^1.2.0
    repository: http://localhost:8080
  - name: mongodb
    version: 7.8.x
    repository: https://charts.helm.sh/stable
```

> The version property is a version number or a range of version numbers following the SemVer 2.0 syntax.

This only works with Helm 3, for backaward compatibilty we can also define `requirements.yaml`

### requirements.yaml

```yaml
dependencies:
  - name: backend
    version: ~1.2.2
    repository: http://127.0.0.1:8879/charts
  - name: frontend
    version: ^1.2.0
    repository: http://127.0.0.1:8879/charts
  - name: mongodb
    version: 7.8.x
    repository: http://127.0.0.1:8879/charts
```

### Semver 2.0 Versions

|    Range    |    Versions    |
| :---------: | :------------: |
|   ~1.2.3    | >=1.2.3,<1.3.0 |
|    1.2.x    | >=1.2.0,<1.3.0 |
|   ^1.2.3    | >=1.2.3,<2.0.0 |
|    1.x.x    | >=1.2.0,<2.0.0 |
| 1.2 - 1.4.5 | >=1.2,<=1.4.5  |

### Charts Dependencies

Once the dependencies are defined, how can we download them? We can do this by running `helm dependency update`

```bash
helm dependency update foo
helm dependency list foo
```

Sometimes you don't want to retrieve new subchart versions because you would like to avoid compatibility issues between your chart and new subchart versions.

We can work with the frozen list of dependencies with the same version numbers, defined in the `chart.lock` file. 

### Chart.lock

```yaml
dependencies:
  - name: backend
    version: 1.2.2
    repository: http://localhost:8080
  - name: frontend
    version: 1.2.0
    repository: http://localhost:8080
  - name: mongodb
    version: 1.2.2
    repository: http://localhost:8080
```

If we need to stick with the same subchart versions, we can run `helm dependency build` followed by the name of our chart.

This command is based on the `chart.lock` file instead of the `chart.yaml` file.

## Adding Conditions and Tags

What if we want certain subcharts to be optional because we want to install dependencies in some releases, but we don't need them in other releases.

> This can be done with conditions and tags:

```yaml
# Chart.yaml
apiVersion: v2
name: foo
[...]
dependencies:
  - name: backend
    version: ~1.2.2
    repository: http://localhost:8080
    condtion: backend.enabled,backend.another_condition
    tags:
      - api
  - name: frontend
    version: ^1.2.0
    repository: http://localhost:8080
  - name: mongodb
    version: 7.8.x
    repository: https://charts.helm.sh/stable
    condition: database.enabled
    tags:
      - api
```

```yaml
# values.yaml
backend:
  enabled: true
frontend:
database:
  enabled: false
```

If multiple subcharts have an optional feature and don't need to be installed, there is another, more convenient way to do a partial installation.

```yaml
# Chart.yaml
apiVersion: v2
name: guestbook
[...]
dependencies:
  - name: backend
    version: ~1.2.2
    repository: http://localhost:8080
    condtion: backend.enabled,backend.another_condition
    tags:
      - api
  - name: frontend
    version: ^1.2.0
    repository: http://localhost:8080
  - name: mongodb
    version: 7.8.x
    repository: https://charts.helm.sh/stable
    condition: database.enabled
    tags:
      - api
```

```yaml
# values.yaml
backend:
frontend:
database:
tags:
  api: true
```

> Note that conditions override tags. So the tag only works **if the condition properties do not exist**.

```yaml
# values.yaml
backend:
  enabled: false
frontend:
database:
  enabled: false
tags:
  api: true
```

### Conditions & Tags

* All charts are downloaded with `helm dependency update`
* Partiall installation with `helm install`
* `--set` overrides value.yaml
* Conditions override tags

```bash
helm dependency update foo
helm install demo foo
helm install demo foo --set database.enabled=true
helm install demo foo --set tags.api=false
```

**Conditions and tags only have a role when you install a chart**. If you run `helm install demo todos`, **some charts are installed and others are not depending on the conditions, tags, and values**. 