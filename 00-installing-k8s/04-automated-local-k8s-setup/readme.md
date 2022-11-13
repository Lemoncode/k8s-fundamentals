## Reference

This is the original [article](https://devopscube.com/kubernetes-cluster-vagrant/)
The following code is extracted from this [repo](https://github.com/scriptcamp/vagrant-kubeadm-kubernetes)

## Prerequisites

Vagrant and VirtualBox

## Startup

```bash
vagrant up
```

Once the system is up we can log into the master by running

```bash
vagrant ssh master
```

We can get the nodes of our cluster by running

```bash
kubectl get nodes
```

```
master-node     Ready    control-plane,master   15m    v1.25.4
worker-node01   Ready    worker                 12m    v1.25.4
worker-node02   Ready    worker                 9m4s   v1.25.4
```

We can find out the pods running in our system by

```bash
kubectl get pods --all-namespaces
```

```
NAMESPACE              NAME                                         READY   STATUS    RESTARTS   AGE
kube-system            calico-kube-controllers-58497c65d5-wdbxk     1/1     Running   0          19m
kube-system            calico-node-24cqj                            1/1     Running   0          17m
kube-system            calico-node-t6fk5                            1/1     Running   0          19m
kube-system            calico-node-tg8tk                            1/1     Running   0          13m
kube-system            coredns-558bd4d5db-5w44v                     1/1     Running   0          19m
kube-system            coredns-558bd4d5db-rh8l6                     1/1     Running   0          19m
kube-system            etcd-master-node                             1/1     Running   0          19m
kube-system            kube-apiserver-master-node                   1/1     Running   0          19m
kube-system            kube-controller-manager-master-node          1/1     Running   0          19m
kube-system            kube-proxy-892vx                             1/1     Running   0          19m
kube-system            kube-proxy-cf6nv                             1/1     Running   0          13m
kube-system            kube-proxy-zb6xz                             1/1     Running   0          17m
kube-system            kube-scheduler-master-node                   1/1     Running   0          19m
kube-system            metrics-server-6cdc946bc4-9gb6g              1/1     Running   0          19m
kubernetes-dashboard   dashboard-metrics-scraper-5594697f48-skl52   1/1     Running   0          19m
kubernetes-dashboard   kubernetes-dashboard-57c9bfc8c8-2b8t5        1/1     Running   0          19m
```

We can deploy a sample nginx app

```bash
kubectl apply -f https://raw.githubusercontent.com/scriptcamp/kubeadm-scripts/main/manifests/sample-app.yaml
deployment.apps/nginx-deployment created
service/nginx-service created
```

You should be able to access Nginx on any of the node’s IPs on port `32000`:

```bash
curl http://10.0.0.10:32000/
curl http://10.0.0.11:32000/
curl http://10.0.0.12:32000/
```

To clean the cluster simply run:

```bash
kubectl delete -f https://raw.githubusercontent.com/scriptcamp/kubeadm-scripts/main/manifests/sample-app.yaml
```

To shut down the K8s VMs

```bash
vagrant halt
```

To destroy the VMs

```bash
vagrant destroy
```
