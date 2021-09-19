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

Copy all files on `random-employee` on a new directory `random-employee-2`, and update `random-employee-2/employee-generator.service.ts` as follows:

```ts
import faker from 'faker';

export interface Employee {
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
  /*diff*/
  createdAt: string; 
  /*diff*/
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string,
  geo: { lat: string, lng: string }
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export const generateEmployee = (): Employee => ({
  ...faker.helpers.userCard(),
  createdAt: Date.now().toString()
});

```

1. Create a `canary deployment` with both versions
2. Create a `blue green deployment` with both versions

## Networking

### Ingress

1. Deploy a ingress controller in your cluster
2. Create an ingress object that exposes `random-employee` functionality

## Overall design

Translate [code example diagram](99-code-example/code-example-diagram.drawio) to K8s citizens, explaining why do you use each K8s object.

Create K8s manifests to deploy on cluster 99-code-example.