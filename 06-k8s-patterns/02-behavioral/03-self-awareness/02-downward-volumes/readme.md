# Downward API volumes

## Steps

### 1. Create a deployemnt that consumes Downward API

Create `random-employee-volumes.pod.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: random-employee
spec:
  volumes:
    - name: pod-info
      downwardAPI:
        items:
          - path: labels # 2
            fieldRef:
              fieldPath: metadata.labels
          - path: annotations # 3
            fieldRef:
              fieldPath: metadata.annotations
  containers:
    - image: jaimesalas/random-employee:0.0.1
      name: random-employee-ctr
      volumeMounts:
        - name: pod-info # 1
          mountPath: /opt/app/pod-info
      resources: {}

```

1. Values from the Downward API can be mounted as files into the Pod
2. Contain all labels in the format `name=value`
3. Holds annotations in the same formmat as labels

Let's run this:

```bash
kubectl apply -f random-employee-volumes.pod.yaml
```

First let's get the new Pod IP:

```bash
POD_IP=$(kubectl get pod random-employee -o=jsonpath='{.status.podIP}')
```

```bash
echo $POD_IP
```

Now from a new terminal create a debugging pod:

```bash
kubectl run -it --rm --restart=Never busybox --image=gcr.io/google-containers/busybox sh
```

Run `wget <Previou POD_IP value>:3000/downward/pod-info`

```bash
Connecting to 172.17.0.6:3000 (172.17.0.6:3000)
pod-info             100% |*****************************************************************************************|     2   0:00:00 ETA
```

And if we check the contents of the file, we get:

```bash
{} 
```

Humm... empty, what is going on? Well if we run:

```bash
kubectl describe pod random-employee
```

We will notice, that we don't have created any labels nor annotations on this pod:

``` 
Name:         random-employee
Namespace:    default
Priority:     0
Node:         minikube/192.168.49.2
Start Time:   Tue, 19 Oct 2021 11:23:55 +0200
Labels:       <none>
Annotations:  <none>
Status:       Running
```

### 2. Adding labels and annotations


Add a new label `app`

```bash
kubectl label pods random-employee app=foo
```

We can check that is updated:

```bash
kubectl get pod random-employee --show-labels
```

Add annotations

```bash
kubectl annotate pods random-employee description='my random employee API'
```

And check the update by running:

```bash
kubectl get pod random-employee -o jsonpath='{.metadata.annotations}'
```

### 3. Check volume content

Back to our `busybox` terminal, or run if you have closed:

```bash
kubectl run -it --rm --restart=Never busybox --image=gcr.io/google-containers/busybox sh
```

Run `wget <Previou POD_IP value>:3000/downward/pod-info`

Or investigating the running Pod:

```bash
kubectl exec -it random-employee -- sh
```

Inside the container run:

```bash
cd /pod-info
```

And check contents

```bash
ls
annotations  labels
```

## Clean up

```bash
kubectl delete -f random-employee-volumes.pod.yaml
```