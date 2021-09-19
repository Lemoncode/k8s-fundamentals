## Basics

### Pods

1. Create a new `Pod` using as base code [random-employee](99-code-example/random-employee).
   1. Create a new image and publish this image to Docker Hub
   2. Use the previous created image to create a `Pod` on imperative way  
   3. Use the previous created image to create a `Pod` on declarative way. 
   4. Check `Pod` functionality by connecting to application container.   

### Deployment

1. Create Deployment for `random-employee`
2. Scale up on imperative way
3. Scale down on imperative way

### Services

1. Create a ClusterIP service that reaches `random-employee` Deployment
2. Create a NodePort service that reaches `random-employee` Deployment
3. Create a LoadBalancer service that reaches `random-employee` Deployment

### ConfigMaps

1. Create a `ConfigMap` that allows change the the port on `random-employee` application container. 

## Deploying Code

## Networking

## Overall design