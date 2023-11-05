## Installing Metrics Server Into Kubernetes

https://github.com/kubernetes-incubator/metrics-server

### 1. Check if metrics server is already installed

```bash
kubectl get svc -n kube-system
```

### 2. If no metrics server is installed

```bash
cd ./metrics-server/kubernetes
```

```bash
kubectl create -f ./kubernetes
```

### 3. Find the metrics server Pod by running

> TODO: Provide jsonpath way

```bash
kubectl get pods -n kube-system
```

### 4. Ensure no errors

```bash
kubectl logs [metrics-server-pod-name] -n kube-system
```

> Note: The `metrics-server-deployment.yaml` file has been modified for Docker Desktop as mentioned [here](https://blog.codewithdan.com/enabling-metrics-server-for-kubernetes-on-docker-desktop):


## Installing on Minikube

```bash
minikube addons enable metrics-server
```

## References

[metrics server GitHub](https://github.com/kubernetes-sigs/metrics-server)
