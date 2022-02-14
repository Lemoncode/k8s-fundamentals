kubectl create namespace monitoring
kubectl create -f ~/prometheus/clusterRole.yaml
kubectl create -f ~/prometheus/config-map.yaml
kubectl create -f ~/prometheus/prometheus-deployment.yaml
kubectl create -f ~/prometheus/prometheus-service.yaml --namespace=monitoring