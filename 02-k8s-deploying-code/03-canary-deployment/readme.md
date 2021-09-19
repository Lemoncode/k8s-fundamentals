## Introduction

In a nutshell, this is a way to run two version of a deployment in production at the same time. Is a way to test out the new version, not have a lot of people hit it, and have most of the people hit the older version and then monitor that new version to make sure everything's good. And then if it is, we can cut over to it.

## Understanding Canary Deployments

Wouldn't be nice to rollout a new Deployment but only route a small percentage of the overall traffic to it to ensure it's working properly?

> Definition from https://docs.microsoft.com: Canary deployment strategy involves deploying new versions of applications next to stable production versions to see how the canary version compares against the baseline before promoting or rejecting the deployment.

### Canary Deployments

* Strategy for checking the viability of a deployment
* Run two indentical production environments at the same time
* Canary Deployment runs alongside the existing stable Deployment
* Canary Deployment is setup to receive minimal traffic

> TODO: Create slides

1. Create Stable
2. Create Canary Deployment
3. Service adds Canary Pod(s) and traffic is routed

## Creating a Canary Deployment

* A Canary Deployment involves 3 main Kubernetes resources:
    - Service
    - Stable Deployment
    - Canary Deployment

We know how to link all resources through labels, so that part is straighforward.

### Defining a Service

```yml
apiVersion: v1
kind: Service
metadata:
  name: stable-service
  labels:
    app: aspnetcore
spec:
  type: LoadBalancer # [1]
  selector:
    app: aspnetcore # [2]
  ports:
  - port: 80
    targetPort: 80
```

1. Any type of service will work here, is up to you
2. Pod label to select for service


### Defining a Stable Deployment

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stable-deployment
spec:
  replicas: 4 # [1]
  selector: # [2]
    matchLabels:
      app: aspnetcore
      track: stable
  template:
    metadata:
      labels:
        app: aspnetcore # [2]
        track: stable
    spec:
      containers:
      - name: stable-app
        image: jaimesalas/stable-app
        ports:
        - containerPort: 80
```

1. The number of replicas of `stable-deployment`
2. The selector that points to our template labels, `aspnetcore` is the same label where the service is pointed to.

### Defining a Canary Deployment

The only thing that is different is the number of replicas, and of course the version. This way we ensure less traffic to canary version.

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: canary-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aspnetcore
      track: canary
  template:
    metadata:
      labels:
        app: aspnetcore
        track: canary
    spec:
      containers:
      - name: canary-app
        image: jaimesalas/canary-app
        ports:
        - containerPort: 80

```

### Creating the Stable and Canary Resources

Use `kubectl create` or `kubectl apply` commands to create the Service, Stable Deployment and Canary Deployment

```bash
# Create Service, Stable Deployment, and Canary Deployment
kubectl create -f [forlder-name] --save-config --record 
```

At last a canary deployment is like any other deployment, but using labels and replicas we determine how the traffic reach to different versions.

## Canary Deployments in Action

[Canary Demo](canary/readme.md)

## Summary

* Canary Deployments allows a new version to be deployed next to a stable version.

* Configured to only handle a small percentage of the traffic initially.

* Once the Canary Deployment is verified it can be scaled up and the existig stable Deployment can be scaled down.
