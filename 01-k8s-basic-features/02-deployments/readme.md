## Deployments Core Concepts

A ReplicaSet is a declarative way to manage Pods

A Deployment is a declarative way to manage Pods using a ReplicaSet

Deployments wrap ReplicaSet and simplified the overall functionality.

Deployments are high order level wrapper around ReplicaSets

* Pods, Deployments and ReplicaSets
    - Pods represent the most basic resource in Kubernetes
    - Can be created and destroyed but are never re-created
    - What happens if a Pod is destroyed?
    - Deployments and ReplicaSets ensure Pods stay running and can be used to scale Pods

* The Role of ReplicaSets
    - ReplicaSets act as a Pod controller
        * Self-healing mechanism
        * Ensure the requested number of Pods are available
        * Provide fault-tolerance
        * Can be used to scale Pods
        * Relies on a Pod template
        * No need to create Pods directly!
        * Used by deployments

* The Role of Deployments
    - A Deployment manage Pods:
        * Pods are managed using ReplicaSets
        * Scales ReplicaSets, which scale Pods
        * Supports zero-downtime updates by creating and destroying ReplicSets
        * Provides rollback functionality
        * Creates a unique label that is assigned to the ReplicaSet and generated Pods
        * YAML is very similar to a ReplicaSet

## Creating a Deployment

To create a deployment we're going to write down a YAML file and use kubectl to create or apply. Let's see an overview:

```yml
apiVersion: apps/v1 # 1
kind: Deployment
metadata: # 2
spec:
  selector: # 3
  template:
    spec: # 4
      containers:
      - name: my-nginx
        image: nginx:alpine # 5
```

1. Kubernetes API version and resource type (Deployement)
2. Metadata about deployment
3. Select Pod template label(s)
4. Template used to create the Pods
5. Containers that will run in the Pod

A more detailed example:

```yml
apiVersion: apps/v1 # 1
kind: Deployment
metadata: # 2
  name: frontend
  labels: 
    app: my-nginx
    tier: frontend
spec:
  selector: # 3
    matchLabels:
      tier: frontend
  template: # 4
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: my-nginx
        image: nginx:alpine
```

1. Kubernetes API version and resource type (Deployment)
2. Metedata about the Deployment. It contains name for deployment, but it also has _labels_. Labels can be used when you're querying multiple resources. Also can be used to tie things together.
3. The selector is used to "select" the template to use (based on labels). The selector property has a _matchLabels_. Only matched on one label, and the key or the name of that label is `tier` and the value `frontend`. If you look down a little bit lower, notice that in the metadata for the template we have _labels tier: frontend_. So the template and the template spec that you see right below it is now going to be hooked to the selector for this deployment. Any label out there of _tier: frontend_, in a Pod template even, would be hooked to this deployment. We can put the template in a separate file.
4. Template to use to create the Pod/Containers (note that the selector matches the label)

We can define our probes for health checking right here:

```yml
apiVersion: apps/v1
kind: Deployment
# More code
template: # 4
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: my-nginx
        image: nginx:alpine
        livenessProbe:
          httpGet:
            path: /index.html
            port: 80
          initialDelayseconds: 15
          timeoutSeconds: 2
          periodSeconds: 5
          failureThreshold: 1
```

## kubectl and Deployments

* Create a Deployment

```bash
kubectl create -f file.deployment.yml
```

Creating a Deployment: Use the _kubectl_ command along with the --filename or -f switch.

Creating or Applying Changes: Use the _kubectl apply_ command along with the --filename or -f switch

```bash
# Alternate way to create or apply changes to a Deployment from YAML
kubectl apply -f file.deployment.yml

# Use --save-config when you want to use
# kubectl apply in the future
kubectl apply -f file.deployment.yml --save-config
```

* Getting Deployments

List all deployments

```bash
kubectl get deployments
```

* Deployment and Labels 

List the labels for all Deployments using the _--show-labels switch_
To get information about a Deployment with a specific label, use _-l switch_ 

```bash
# List all Deployments and their labels
kubectl get deployment --show-labels

# Get all Deployments with a specific label
kubectl get deployment -l app=nginx
```

* Deleting a Deployment

To delete a Deployment use kubectl delete
Will delete the Deployment and all associated Pods/Containers

```bash
# Delete Deployment
kubectl delete deployment [deployment-name]
```

* Scaling Pods Horizontally

Update the YAML file or use kubectl scale command

```bash
# Scale the Deployment Pods to 5
kubectl scale deployment [deployment-name] --replicas=5

# Scale by referencing the YAML file
kubectl scale -f file.deployment.yml --replicas=5
```

We can also put the replicas into the _yaml_ when we start

```yml
spec:
  replicas: 3
  selector: 
    tier: frontend
```

## kubectl Deployments Demo

[kubectl deployments demo](02-deployments/01-kubectl-deployments-demo)

## Why use deployment instead replicas sets

[Article reference](https://blog.macstadium.com/blog/how-to-k8s-pods-replicasets-and-deployments)

## Deployment Options

> Zero downtime deployments allow software updates to be deployed to production without impacting end users.

* One of the strengths of Kubernetes is zero downtime deployments

* Update an application's Pods without imapcting end users

* Several options are available:
    - Rolling updates
        * This is the deafult. Sustituir poco a poco los pods de la antigua versión por los de la nueva versión.
    - Blue-green deployments
        * You have multiple environments running at the same time, and when you probe that the new environment is ready we switch traffic to the new application
    - Canary deployments
        * Route just a little of traffic
    - Rollbacks
        * Go back to previous versions

* Updating a Deployment

Update a deployment by changing the YAML and applying changes to the cluster with kubectl apply

```bash
# Apply changes made in a YAML file
kubectl apply -f file.deployment.yml
```
