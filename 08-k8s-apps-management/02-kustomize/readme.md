## Overview

Kustomize traverses a Kubernetes manifest to add, remove or update configuration options without forking. It is available both as a standalone binary and as a native feature of `kubectl`.

* Purely declarative approach to configuration customization
* Natively built into `kubectl`
* Manage an arbitrary number of distinctly customized Kubernetes configurations
* Available as a standalone binary for extension and integration into other services
* Every artifact that kustomize uses is plain YAML and can be validated and processed as such
* Kustomize encourages a fork/modify/rebase workflow

Kustomize was created as a response to template-heavy approaches like Helm to configure and customize Kubernetes clusters. It is designed around the principle of declarative application management. It takes a valid Kubernetes YAML manifest (base) and specializes it or extends it by overlaying additional YAML patches (overlays). Overlays depend on their bases. All files are valid YAML files. There are no placeholders.

> A `kustomization.yaml` file controls the process. Any directory that contains a `kustomization.yaml` file is called a root.

> One of the best use cases for kustomize is organizing your system into multiple namespaces such as staging and production.

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

> The script does not work with ARM architectures, to install it on ARM architectures we need to download the desireable package follow this [link](https://github.com/kubernetes-sigs/kustomize/releases)

### Kustomize commands

* `kustomize build` - Build a kustomization target from a directory or URL. If everything goes fine, we get the related K8s manifests
* `kustomize cfg` - Commands for reading and writing configuration
* `kustomize completion` - Generate shell completion script
* `kustomize create` - Create a new kustomization in the current directory
* `kustomize edit` - Edits a kustomization file
* `ksutomize fn` - Commands for running functions against configuration.

If we want to deploy the manifests we can use `kubectl apply -k`

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

## References

[Patch strategies](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-api-machinery/strategic-merge-patch.md)

[JsonPatches6902 Overview](https://skryvets.com/blog/2019/05/15/kubernetes-kustomize-json-patches-6902/)
