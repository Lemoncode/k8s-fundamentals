## Introduction

With Canary Deployments we deployed two versions of a deployment at the same time, but only have a small amount of traffic hitting that newer version of the deployment. But what happens when you'd like to do something like a canary deployment, but not have any of the end users in production actually hiting the app, but we would like you or your team or maybe a stakeholder to be able to verify, that the app is good, and then if it is, redirect traffic over to that one. That's a **Blue/Green** deployment. 

## Understanding Blue-Green Deployments

> Have you ever deployed an application to production and experience problems? 

We all have hit this scenario regardless of how much testing you might have done in your QA, staging, test, whatever you call it, environment problems just come up from time to time. 

Blue / Green simple definition: 

> A blue/green deployment is a change management strategy for releasing software code. 

Blue / Green detailed definition: 

> A blue/green deployment is a change management strategy for releasing software code. Blue/green deployments, which may also be referred as A/B deployments require two indentical hardaware environments that are configured exactly the same way. While one environmnet is active and serving end users, the other environment remains idle.

We can go in and use that other environment to test things out, and then we could switch over to that new environment. 

Imagine that you already have a deployment out there and we're gonna call that the **Blue Deployment** and it's stable. Users are happy, but you have some updates to to make. But you don't want to just do a rolling update because you want to check that everything's working properly and then switch over. 

We could do is roll out that new deployment, the **Green deployment** and we'll set up a **separate service**. We can then hit the new version of the APP and test it.

Is a strategy for again checking the viability of a deployment, but before it's publicly available. With a canary deployment, recall that we had two environments running, but the canary version of that, only got a small percentage of the actual traffic. Well, in the case of a **blue/green** deployment, we're going to deploy the green exactly as the blue. So if the blue are four pods, the green will be four pods as well, to make it identical, and assert that everything works as expected. 

So we're running two identical production environments at the same time. There could be consequences of that because it depends on how many pods you are capable of running on your hardware on your cluster. So the new application (or green) is going to be deployed alongside the old application what we called the blue deployment. 

Now traffic will be routed from blue to green only when our viability in our test checks have passed. Once that stage has been hit, then we can go ahead and send traffic to the green app, and then eventually we could delete the blue deployment and remove of all those pods.

* Strategy for checking the viability of a deployment before it's publicly available.
* Run two identical production environments at the same time.
* New application (green) is deployed alongside the old application (blue).
* Traffic routed from blue to green when check pass

You could see that the big difference between Blue/Green and the canaries, with a canary you're running two versions of a deployment in production or in any environment, but end users could still hit both, with a blue/green deployment is very similar initially, but we're going to have to separate. 

> A blue service is for the current deployment pods and a green service for the new deployment pods. 

> TODO: Include Image

* Key considerations:
    - How many Pods are being deployed to each environment?
    - How much memory is required to run the Pods?
    - What are the CPU requirements?
    - Other considerations (volumes sessions, node affinity, etc.)


## Creating a Blue-Green Deployment

Let's walk through what the YAML would look like. 

* A Blue-Green Deployment involves 3 main Kubernetes resources:
    - Test Service
    - Public Service
    - Deployment

Let's walk through the yaml, and see what will be required to create the test service, the public service and the deployment. 

```yaml
kind: Service
apiVersion: v1
metadata:
    name: nginx-blue-test
    labels:
        app: nginx
        role: blue-test
        env: test
spec:
    type: LoadBalancer
    # .......
    ports:
        - port: 9000
          targetPort: 80
```

So the first thing we're gonna do is create a standard kubernetes service in yaml, with the name of `nginx-blue-test`. Notice that we're adding some labels here:

* app: nginx
* role: blue-test - Clarify what is for.
* env: test - This might run on production environment, we're going to use test service to test things, so we're using this label to set the environment. Now, don't confuse this with a dedicated test environment. This is more just a different route to get into these pods, so that sums up the metadata for this particular blue test service. 

Now jumping down to the `spec section` 

```yaml
kind: Service
apiVersion: v1
metadata:
    name: nginx-blue-test
    labels:
        app: nginx
        role: blue-test
        env: test
spec:
    type: LoadBalancer
    selector:
        app: nginx
        role: blue
    ports:
        - port: 9000
          targetPort: 80
```

This service is a `LoadBalancer`, and the selector is `app: nginx`, `role: blue`. Now the role could be anything you want. 

We're exposing port 9000 and then the containers are listening on port 80. Notice that it's not a port 80 on the external port to port 9000, because is a test service. Our users are not going to be using port 9000. 

So now we need to create the public service. 

```yaml
kind: Service
apiVersion: v1
metadata:
    name: nginx-service
    # ....
spec:
    type: LoadBalancer
    # ....
    ports:
        - port: 80
          targetPort: 80
```


That's gonna be very much the same as what you just saw, with a few key differences, 

```yaml
kind: Service
apiVersion: v1
metadata:
    name: nginx-service
    labels:
        app: nginx
        role: blue
        env: prod
spec:
    type: LoadBalancer
    # ....
    ports:
        - port: 80
          targetPort: 80
```

We're gonna have our metadata about this service we have `app: nginx`, `role: blue` again. Notice this time we said, `env: prod`. 

```yaml
kind: Service
apiVersion: v1
metadata:
    name: nginx-service
    labels:
        app: nginx
        role: blue
        env: prod
spec:
    type: LoadBalancer
    selector:
        app: nginx
        role: blue
    ports:
        - port: 80
          targetPort: 80
```

We have our load balancer again, but we have a selector of `app: nginx` and `role: blue`.  The key thing is, we have `port: 80` on this one so, that our users can hit it, not have to know anything special. 

The final resource we need to get out there is obviously our deployment. 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-$TARGET_ROLE
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx 
      role: blue
  template:
    metadata:
      labels:
        app: nginx
        role: blue
    spec:
      containers:
      - name: nginx-blue
        image: nginx:1.x.x-alpine
        imagePullPolicy: Always
        ports:
        - containerPort: 80

```

Now we had our labels earlier, our `role` and `app` labels, and you're going to notice we're going to use those here. So first of, looking towards the top, we have our standards suspects our `apiVersion` and `kind` and some `metadata` about the name.  

But looking down the selector, you'll notice this is `role: blue` again, and then if we jump on down a little bit further to where the labels are inside of our template, you'll notice its `role: blue`. So we're gonna be selecting `app: nginx`, `role: blue`. Our test service and our public service are also selecting those labels, therefore, they will route the traffic to these pods. 

Now the final thing is noticed the `image` in this case, this would be what we call our stable deployment. And then once this is ready to go would use our `kubectl commands` whether its create or apply, and we get our test service, our public service and demployment out there. 

For the green, we're going to do the same thing. We're going to create a test service first, get that green deployment out there tested out. And then once it's good we could change over to the green. 

So in changing from blue to green, what we can do is simply change the selector from `role: blue` to `role green`. 

So if we had this in our yaml `role: green`, then we could either change that inside of our public service and then run a `kubectl apply` on it. Or we could do it imperatively. And we could do a set selector on that service and say roll equals green, and that would automatically reroute that traffic from the blue to the green. 

* Changing From Blue to Green
    - Once a GREEN deployment has been successfully rolled out and tested, change the public service's selector to 'green'

```bash
kubectl apply -f file.service.yml

kubectl set selector svc [service-name] 'role=green'
```

## Creating K8s Objects for Blue / Green Deployment

[Creating K8s Objects for Blue / Green Deployment](./01-blue-green-deployment/readme.md)


## Blue-Green Deployments - The Blue Deployment Demo

[Blue-Green Blue Deployment Demo](./01-blue-green-deployment/blue-deployment.readme.md)

## Blue-Green Deployments  - The Green Deployment Demo

[Blue-Green Green Deployment Demo](./01-blue-green-deployment/green-deployment.readme.md)

### Cleanup

```bash
kubectl delete svc nginx-blue-test nginx-green-test nginx-service
kubectl delete deployment nginx-deployment-blue nginx-deployment-green
```

## Summary

* Blue-Green Deployments allow two environments to be deployed at the same time

* Provides a way to test a new version of applicationn before switching over to it

* Works by changing the "blue" Service's selector to pint to "green" Deployment

