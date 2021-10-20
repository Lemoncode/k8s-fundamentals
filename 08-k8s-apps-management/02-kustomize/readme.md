## Overview

Kustomize traverses a Kubernetes manifest to add, remove or update configuration options without forking. It is available both as a standalone binary and as a native feature of `kubectl`.

* Purely declarative approach to configuration customization
* Natively built into `kubectl`
* Manage an arbitrary number of distinctly customized Kubernetes configurations
* Available as a standalone binary for extension and integration into other services
* Every artifact that kustomize uses is plain YAML and can be validated and processed as such
* Kustomize encourages a fork/modify/rebase workflow

## Installing Kustomize

### Using binaries

```bash
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
```

```bash
chmod +x kustomize
```

```bash
sudo mv kustomize /usr/local/bin
```

> It does not work with ARM architectures

### Docker Images

[GCR Page](https://console.cloud.google.com/gcr/images/k8s-artifacts-prod/US/kustomize/kustomize)

Starting with Kustomize v3.8.7, docker images are available to run Kustomize. The images are hosted in kubernetes official GCR repositories.

The following commands are how to pull and run kustomize 3.8.7 docker image.

```bash
docker pull k8s.gcr.io/kustomize/kustomize:v3.8.7
docker run k8s.gcr.io/kustomize/kustomize:v3.8.7 version
```

## Kustomize examples

[Demo: Introduction](01-introduction/readme.md)