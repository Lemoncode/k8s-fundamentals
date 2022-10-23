## Introduction

[Kubernetes Deployments Official Docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

Rolling Update deployments are the default strategy that K8s uses to move pods into a cluster. So wether you're adding new pods or we're going to take existing pods and then replace them, an update strategy would be used behind the scenes. Now, the power of this is that we don't have to deploy the V2 of the app all at once.

## Understanding Rolling Updates Deployments

> Kubernetes Documentation: "Rolling updates allow Deployments update to take place with zero downtime by incrementally update pods instances with new ones."

* ReplicaSets increase new Pods while decreasing old Pods
* Service handles load balancing traffic to available Pods
* New Pods only scheduled on available Nodes
* Deployments support two strategy options:
    - Rolling Update (default)
    - Recreate (can result in down-time) -> what it would do is delete the older pods and recreate them. An that way you can get a fresh copy out there if you need to. 

> TODO: Add diagrams

## Creating a Rolling Update Deployment

### Defining a Rolling Update Deployment

```yaml
apiVersion: apps/v1
kiind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2 # 1
  minReadySeconds: 1 # 2
  progressDeadlineSeconds: 60 # 3
  revisionHistoryLimit: 5 # 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
```

1. Number of Pod replicas
2. Seconds new Pod should be ready to be considered healthy (0)
3. Seconds to wait before reporting stalled (estancado) Deployment
4. Number of ReplicaSets that can be rolled back (default 10) -> I want five items in the history for this deployment so I could deploy five times they'd be tracked, and then on the sixth, it would start to override the oldest one.

```yaml
strategy:
  type: RollingUpdate # 1
  rollingUpdate:
    maxSurge: 1 # 2
    maxUnavailable: 1 # 3
```

1. RollingUpdate (default) or Recreate strategy
2. Max Pods that can exceed the replicas count (25%) (surge - oleada) -> when it goes to roll out new pods. If we had a replicas of two. let's say and that's our replicas in this case, then how many pods above two is it allowed to go? In this case we are saying a max of one that would mean a total of three.
3. Max Pods that are not operational (25%) -> It's going to be deleting pods as well. At some point, how many pods could be unavailable while it's doing the rolling update?

### Understanding maxSurge

> TODO: Add diagram

How many Pods can be added above the replicas count during the rolling update?

replicas = 2 + maxSurge = 1 => current = 3

### Understanding maxUnavailable

> TODO: Add diagram

How many of the existing Pods can be made unavailable during a rolling update? So let's say we have this scenario here (2 pods, one available and the other one not available) where we have one that's still alive and available (and the other pod is not available). If we said `maxUnavailable = 1` It's OK for 1 of the 2 replicas to be unavailable.

### Creating the Deployment

Use the `kubectl create` command along with the `--filename` or `-f` switch.

```bash
# Create a initial deployment
kubectl create -f file.deployment.yml --save-config --record
```

Where `--save-config` save configuration in resource's annotations and `--record` records the command in the Deployment revision history.


### Creating or Modifying a Deployment

Use the `kubectl apply` command along with the `--filename` or `-f` switch.

```bash
# Create initial deployment
kubectl apply -f file.deployment.yml --record
```

We can add `--record` to record the command in the Deployment revision history

### Checking the Deployment Status

The `kubectl rollout status` command can be used to get information about specific deployment.

```bash
# Get information about a Deployment
kubectl rollout status deployment [deployment-name]
```

## Rolling Update Deployment in Action

[Rolling Update Demo](rolling-update/readme.md)

## Rolling Back Deployments

* Rolling update revisions can be tracked using --record
* If a Deployment has issues, a new Deployment can be applied, or you can revert to a previous revision
* Several kubectl commands can be used for rollbacks:
  - kubectl rollout status
  - kubectl rollout history
  - kubectl rollout undo

### Checking Deployment History

The `kubectl rollout history` command can be used to view history of a Deployment

```bash
# Get information about the a Deplyment
kubectl rollout history deployment [deployment-name]

# Get information about the a Deplyment
kubectl rollout history deployment [deployment-name] --revision=2
```

### Rolling Back a Deployment

Use the `kubectl rollout undo` command to rollback to a specific Deployment revision

```bash
# Check status
kubectl rollout status -f file.deployment.yml

# Rollback a Deployment
kubectl rollout undo -f file.deployment.yml

# Rollback a Deployment
kubectl rollout undo deploymeny [deployment-name] --to-revision=2
```

## Rolling Back Deployments Demo

[Rolling Back Deployments Demo](02-rolling-back-demo/readme.md)

## Summary

* Rolling updates are default Deployment strategy used by Kubernetes
* Ensures zero-downtime during a Deployment
* Maximum and minimum Pods available during a Deployment can be defined
* Deployments can be recorded and stored in history using `--record`
* Deployments can be rolled back to a specific revision

## Open dscussion

Using record leads to following **warning**:

> Flag --record has been deprecated, --record will be removed in the future

* [how update a deployment with rollback support](https://stackoverflow.com/questions/70521359/how-do-i-update-a-deployment-via-yaml-with-rollback-support)
* [Deprecated and remove --rcord flag from kubectl](https://github.com/kubernetes/kubernetes/issues/40422)
