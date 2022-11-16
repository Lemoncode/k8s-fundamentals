# Introduction Kustomize

* Kustomize helps customizing config files in a template free way.
* Kustomize provides a number of handy methods like generators to make customization easier.
* Kustomize uses patches to introduce environment specific changes on an already existing standard config file without disturbing it.

Kustomize provides a solution for customizing Kubernetes resource configuration free from templates and DSLs.

Kustomize lets you customize raw, template-free YAML files for multiple purposes, leaving the original YAML untouched and usable as is.

Kustomize targets kubernetes; it understands and can patch kubernetes style API objects. It’s like [make](https://www.gnu.org/software/make/), in that what it does is declared in a file, and it’s like [sed](https://www.gnu.org/software/sed/), in that it emits edited text.

## Usage

### 1. Make a kustomization file

In some directory containing your YAML `resource` files (deployments, services, configmaps, etc.) create a `kustomization` file.

This file should declare those resources, and any customization to apply to them, e.g. add a common label.

File structure:

```
~/app-resources
├── deployment.yaml
├── kustomization.yaml
└── service.yaml
```

The resources in this directory could be a fork of someone else’s configuration. If so, you can easily rebase from the source material to capture improvements, because you don’t modify the resources directly.

Generate customized YAML with:

```bash
kustomize build ~/app-resources
```

Using docker 

```bash
docker run \
 -v `pwd`/app-resources:/tmp \
 k8s.gcr.io/kustomize/kustomize:v3.8.7 build /tmp
```

Inspecting the running container

```bash
docker run -it --entrypoint /bin/sh k8s.gcr.io/kustomize/kustomize:v3.8.7
```

> We will find that the working directory is `/app` so if we map something to this directory inside the container, the `kustomize` binary will not be found.

