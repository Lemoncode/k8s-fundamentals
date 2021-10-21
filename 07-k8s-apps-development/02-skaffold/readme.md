# Skaffold

## Introduction

`Skaffold` allows us run and develop against local clusters or even remote clusters.

## Skaffold Overview

> Skaffold = Local Kubernetes Development

Can build your images and deploy your containers. It will deploy those containers to the K8s cluster that we choose. By default it will use the local cluster: Docker Desktop, minikube...

> Skaffold handles the workflow for building, pushing and deploying your applicatin, allowing you to focus on what matters most: writing code.


> `Official definition`: Skaffold is a command line tool that facilitates continuous development for Kubernetes-native applications. Skaffold handles the workflow for building, pushing, and deploying your application, and provides building blocks for creating CI/CD pipelines. This enables you to focus on iterating on your application locally while Skaffold continuously deploys to your local or remote Kubernetes cluster.

### Docker Compose and Skaffold

docker-compose.yml ==> `skaffold init` ==> `K8s YAML` + `skaffold.yaml`

> `Skaffold` uses `Kompose`

It's going to generate yaml files that we see previously, and also it's going to generate a type of build artifact file `skaffold.yaml`. This is going to be the file that will monitor your local code for changes. Automatically rerun the Docker build process and then even handling the deployment of that updated image to get that container for the image running in a pod in K8s.

```yaml
apiVersion: skaffold/[version] # 1 - start
kind: Config
metadata:
  name: skaffold-foo # 1 - end
build: # 2 - start
  artifacts:
  - image: nginx
    context: .
    docker: 
      dockerfile: Dockerfile # 2- end
deploy: # 3 - start
  kubectl:
    manifests:
    - k8s/*.yml # 3 - end
```

1. First we have a section like any other K8s object. This also shows us the version that we're using.
2. This section contains the artifacts to watch for changes. In this case is refering the context to the current directory and use Docker via Dockerfile to create this artifact.
3. In this section we specify how to deploy to K8s.

### Skaffold Pipeline Stages

```
[Detect source code changes] ==> [Build Artifacts] ==> [Test Artifacts] ==> [Tag Artifacts] ==> [Render Manifests] ==> [Deploy Manifests] ==> [Tail logs & Forward Ports]
          |                                                                                                                                               |
      [File sync]                                                                                                                             [Clean up images and resources]
```

First off, it can detect source code changes, and it has a built in `file sync` to monitor those changes. Then we'll go ahead and `build your artifacts`, make sure they're working properly, even `tagged them` and then `render the manifest` that are needed so that they could be deployed. 

Once that happens, then we would have an actual pod with containers in kubernetes. And then it can even tail the logs and even do port forwarding. 

Now talling the logs, if you're not familiar with that, it basically exposes the logs to us so that we can see those directly, for example, in a console if we wanted. 

Now, once we're done with this, if you just hit control C to stop the console, then it will automatically do a kubectl delete type process and clean up all the different resource is that we might have. 

And that's actually really, really nice. 

[Skaffold Pipelines stages](https://skaffold.dev/docs/pipeline-stages)

## Demo: Installing Skaffold

[Demo: Installing Skaffold](01-installing/readme.md)

## Demo: Getting Started

[Demo: Getting Started](02-getting-started/readme.md)

## Skaffold Commands

### Generating a `skaffold.yml` file

`skaffold init` can be used to generate the initial configuration to deploy a project to Kubernetes.

Provides flags to reference a Docker Compose YAML file as a starting point, existing Kubernetes manifests files and more.

```bash
# Generate configuration to deploy a project to Kubernetes
skaffold init

# Base the configuration on a Docker Compose file
skaffold init --compose-file docker-compose.yml

# Define Kubernetes manifest files location
skaffold init -k ./k8s*.yml 
```

Behind the scenes this command `skaffold init --compose-file docker-compose.yml` uses the `Kompose` tool. 

If you already have your K8s files and just want to run your containers in K8s, you can run `skaffold init -k ./k8s*.yml`

The end result of all these commands is the `skaffold.yaml` file.

### Defining Build Artifacts

`--artifact` or `-a` can be used to define build artifacts such as the location of your Dockerfiles.

```bash
# Defining Build Artifacts
skaffold init --compose-file docker-compose.yml \
 -a '{"builder":"Docker","payload":{"path":"./dev.dockerfile"},"image":"foo"}'
```

We also need to tell it where are the blueprints to build the container images. In this case the `Dockerfile`. We can edit by hand `skaffold.yaml`, or use the above command feeding `-a` flag.

### Build and Deploy Using Skaffold

`skaffold dev` can watch your code for changes, build it, and deploy it automatically.

```bash
# Run a build/deployment pipeline in development mode
# Triggers a watch loop build and deploy workflow
skaffold dev

# Build and deploy project one time
skaffold run
```

## Demo: skaffold init

[Demo: skaffold init](03-skaffold-init/readme.md)

## Demo: skaffold dev

[Demo: skaffold dev](01-skaffold-init/readme.md)


## References

[Getting started with your project](https://skaffold.dev/docs/workflows/getting-started-with-your-project/)