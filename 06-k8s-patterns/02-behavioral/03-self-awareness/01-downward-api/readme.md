# Downward API

## Steps

### 1. Create a deployemnt that consumes Downward API

Create `random-employee.pod.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: random-employee
spec:
  containers:
    - image: jaimesalas/random-employee:0.0.1
      name: random-employee-ctr
      env:
        - name: POD_IP
          valueFrom:
            fieldRef: # 1
              fieldPath: status.podIP
        - name: MEMORY_LIMIT
          valueFrom:
            resourceFieldRef:
              containerName: random-employee-ctr # 2
              resource: limits.memory
      resources: {}

```

1. POD_IP, comes from the properties of the Pod
2. Set to the value of the memory resource limit of the container

To access Pod metadata, we're using `fieldRef`

Let's run this:

```bash
kubectl apply -f random-employee.pod.yaml
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

Run `wget <Previou POD_IP value>:3000/downward`

```bash
Connecting to 172.17.0.6:3000 (172.17.0.6:3000)
downward             100% |***************************************************************************************|    50   0:00:00 ETA
/ # wget 172.17.0.6:3000/downward | echo
Connecting to 172.17.0.6:3000 (172.17.0.6:3000)
``` 

```bash
/ # cat downward
{"podIp":"172.17.0.6","memoryLimit":"16654012416"}/ 
```

## Clean up

```bash
kubectl delete -f random-employee.pod.yaml
```