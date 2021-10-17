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