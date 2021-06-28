## Introduction

Kubernetes doesn't just expose a way to orchestrate containers, also give us features to make deployments.

## Kubernetes Deployments Overview

Deployments run a real critical role in Kubernetes because they are the mechanism for creating pods that ultimetly run the containers that host our code. With deployments we will send standard kubectl commands to the API, and then the controllers will schedule what happens on the nodes.

The goal of deployment it's to deploy pods. To have this pods we need a _Kubernetes deployment_, a _Kubernetes deployment_ relies on a _replica set_.

A **ReplicaSet** is a declarative way to manage _Pods_. Are in charged of the number of pods we requested.

A **Deployment** is a declative way to manage _Pods_ using a _ReplicaSet_. We can go ahead and just use _ReplicaSets_, but _Deployments_ offer an extra layer that make easier working with deploys.

## Creating an Initial Deployment

yaml + kubectl => Deployment

### Defining a Deployment

```yaml
apiVersion: apps/v1 #
kind: Deployment
metadata:
  name: frontend # 2
  labels:
    app: my-nginx
    tier: frontend
spec:
  selector:
    matchLabels: # 3
      tier: frontend
  template: # 4
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: my-nginx
        image: ngnix:alpine
```

1. Kubernetes API version and resource type (Deployment)

2. Metadata about Deployment

3. The selector is used to "select"  the template to use (based on labels)

4. Template to use to create the Pod/Containers (note that the selector matches the label)


### Creating a Deployment

Use the `kubectl create` command along with the --filename or -f switch.

```bash
# Create a Deployment
kubectl create -f file.deployment.yml --save-config
```

**--save-config** - Store current properties in resource's annotations. Basically it grabs a snapshot of the starting metadata if you will, and stores that, now later, we can apply changes.

### Creating or Applying Changes 

Use the `kubectl apply` command along the --filename or -f switch

```bash
# Alternate way to create or apply changes
# Deployment from YAML
kubectl apply -f file.deployment.yml
```

If we use `create` and the Kubernetes resource is already created we will get an exception. If we instead use `apply`, and the resource exists, will apply the changes to that reosurce. 

### Scale Pods Horizontaly 

Update the YAML file (declarative) or use the `kubcetl scale` commnad

```bash
# Scale the Deployment Pods to 5 (imperative)
kubectl scale deployment [deployment-name] --replicas=5 

# Scale by referencing the YAML file (imperative)
kubectl scale -f file.deployment.yml --replicas=5
```

## Kubernetes Deployments - Basic Deployment Demo

[Basic Deployment Demo](01-basic-deployment/readme.md)

## Kubernetes Deployment Options

### How do you update existing Pods? 

* Delete all existing Pods and replace with new Pods? Leads to a short down-time.

* Start new Pods and then delete old Pods? Need to be able to run two versions simultaneously.

* Replace existing Pods one by one without impacting traffic to Pods? This is the default way on Kubernetes

> TODO: Add slides

### Deployment Options

* One of the strengths of Kubernetes is "zero-downtime deployments"
* Update an application's Pods without impacting end users
* Several Options are available:
    - Rolling Updates
    - Blue-Green Deployments
    - Canary Deploymments
    - Rollbacks

**Zero-downtime deployments** allow software updates to be deployed to prodcution without impacting end users.

## Summary

Deployments are a key resource provided by Kubernetes

Deployments rely on ReplicaSets to schedule schedule and manage Pods

Kubernetes supports Zero-downtime deployments out of the box

Several Deployment options exist:

* Zero-downtime
* Rolling Updates
* Canary
* Blue-Green
