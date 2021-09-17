## Overview

Kustomize traverses a Kubernetes manifest to add, remove or update configuration options without forking. It is available both as a standalone binary and as a native feature of `kubectl`.

* Purely declarative approach to configuration customization
* Natively built into `kubectl`
* Manage an arbitrary number of distinctly customized Kubernetes configurations
* Available as a standalone binary for extension and integration into other services
* Every artifact that kustomize uses is plain YAML and can be validated and processed as such
* Kustomize encourages a fork/modify/rebase workflow

## Installing Kustomize

### Docker Images

Starting with Kustomize v3.8.7, docker images are available to run Kustomize. The images are hosted in kubernetes official GCR repositories.

The following commands are how to pull and run kustomize 3.8.7 docker image.

```bash
docker pull k8s.gcr.io/kustomize/kustomize:v3.8.7
docker run k8s.gcr.io/kustomize/kustomize:v3.8.7 version
```

## Kustomize examples

## References

[kustomize.io](https://kustomize.io/)

[Kustomize vs Helm](https://stackoverflow.com/questions/60519939/what-is-the-difference-between-helm-and-kustomize)

[Kustomize overview](https://learning.oreilly.com/videos/modern-container-based-devops/9780136870975/9780136870975-MCD1_03_13_07)

[Kustomize tutorial](https://www.densify.com/kubernetes-tools/kustomize)

[Kustomize Creating a K8s app out of multiple pieces](https://www.mirantis.com/blog/introduction-to-kustomize-part-1-creating-a-kubernetes-app-out-of-multiple-pieces/)

[Kustomize 101 - The right way to do templating on Kubernetes](https://blog.stack-labs.com/code/kustomize-101/)

[Kustomize GitHub Repository](https://github.com/kubernetes-sigs/kustomize)

[Kustomize components](https://kubectl.docs.kubernetes.io/guides/config_management/components/)

[json 6902 standard](https://datatracker.ietf.org/doc/html/rfc6902)

[kustomize introduction official guide](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)