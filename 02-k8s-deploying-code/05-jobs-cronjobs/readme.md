## Introduction

We've focused a lot on `deployment` and `replicaset resources`, and now we're going to switch to a different type of workload, call `job` and `cron job`. These are two different types of resources that K8s supports. 

## Unsderstanding Jobs

Basically a `job` runs a task that has a termination. Now this is very different than just a standard deployment of a pod in Kubernetes, because normally those pods we'd like to keep up and running. We hope they don't go down, whereas with a job, it's different. It could run, and then it's not. 

The kubernetes documentation defines it this way. 

> A job creates one of more pods and insurers that a specified number of them successfully terminated. 

A Job creates a pod or pods that can perform a task or some type of a batch process. A job does not run forever, it's a one time thing, and then it's done. It may only run once ever. It just depends on the type of job you're doing. 

Jobs can also be configured to run multiple pods in parallel. And this is useful in scenarios where you want to multitask. 

Imagine, you need to get data from multiple servers and you're gonna run a job. It runs a bunch of pods, hits individual servers and then aggregates that data. 

Now as Jobs complete, their status is going to be tracked by kubernetes. And that way you'll know did a job complete successfully, whether it was one pod or many pods running in parallel. 

Once a job is deleted, its pods are going to be removed. If you don't delete the job, the pods will be hang around, even if the it's done. The reason is you might want to go back and view the history, the logs, for example, of a given pod. Maybe something went wrong with that job, and you like to get more details. But as soon as you delete the official job, then it will delete the pods as well. 

* A Job creates a Pod(s) that performs a task or batch process

* Unlike standard Pods, a Job does not run indefinitely 

* A Job can be configured to run multiple Pods in parallel

* Successful completions are tracked

* Once a Job is deleted its Pods are removed

What type of jobs could we do?

* Retrieve and cache remote data
* Process queues
* Perform Backup
* Move Data between DBs

The big thing to understand, is a job is a one time thing. In scenarios where it's not just a one time job, you want to run it on recurring basis, we move to `CronJobs`.

## How a Job looks like

Let's start with how do we create or to find a Job and then ultimately create it to run it in the cluster.

```yaml
apiVersion: batch/v1 # 1.
kind: Job
metadata:
  name: pi-counter
spec:
  template:
    metadata:
      name: pi-counter
    spec:
      restartPolicy: Never # OnFailure or Never # 2.
      containers:
      - name: pi-counter
        image: alpine
        command: # 3.
          - "sh"
          - "-c" 
          - "echo 'scale=1000; 4*a(1)' | bc -l;sleep 2;"


```

1. We're going to encounter a new API, you can notice this `batch/V1`, a new `kind:Job`, and then the rest of it you'll recognize from deployments, pod templates, things like that. We have our metadata and notice. If we move on down, we have our spec for containers, the image, the command to run things like that. 

2. Now you'll notice, though a restart policy here and in this case, it's never. What will happen here is if one of the containers in a pod let's assume it just has one container, if it fails, we're saying never restarted for that job. Now the only other option in this case would be on failure, so you can do never or on failure on failure would mean if the container does fail, it can try to restart it and do it again. And then it has a max number of consent of how many failures are allowed before marks that job as unsuccessful. We could even configure how long a job is allowed to be actively, let's say 30 seconds, but we're finding out it's taking five minutes. 

3. Now moving on down a Job is really a task or maybe a batch process. We want to run now. In this case, I'm just showing out to an S H command in an alpine container and I'm gonna calculate pi digits.

We might say that we want to be able to run multiple pods sequentially. 

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-counter
spec:
  completions: 4 # 1
  template:
  # .....
```

1. How many completions are required to mark a job as successful. 

Now this gets us into what's called parallelism. 

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-counter
spec:
  completions: 4 # 1
  parallelism: 2 # 2
  template:
  # .....
```

2. We can say I would like to run two pods together at one time and then before that job is marked as complete, I need four total to finished successfully. Imagine we were doing database queries with large amounts of data, we could actually divide up that work. So the pods, in the containers, would have to know how to do their individual unit of work. But we could divide that up, starting both up and then start to more up after that. But we'd only allow to it in time to run. And then we want four to be completed successfully, so this would be useful in those cases where I have a bunch of servers, I need to go aggregate logs because it's some custom process, or I need to go in a database and clean up old records. I need to look at message queues, different queues. We could divide that work up if we'd like into this. 


Now, in order to take that yaml and actually create a Job. We do the standard `kubectl commands`:

```bash
# Create a new Job
$ kubectl create -f file.job.yaml --save-config

# Create or modifying a Job
$ kubectl apply -f file.job.yaml
```

The only thing you have to worry about is just getting the Job yaml right.

## Jobs Demo

[Job Demo](01-job-demo/readme.md)

### Clenaup

```bash
$ kubectl delete job pi-counter
```

## Summary

* Jobs are used to run a task or batch process

* Successful completions are tracked

* CronJobs allow a task/batch process to be run on a scheduled basis

* Relies on Cron Format
