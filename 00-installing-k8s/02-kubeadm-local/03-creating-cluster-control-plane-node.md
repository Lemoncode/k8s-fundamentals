# Creating a Cluster Control Plane Node

> IMPORTANT: If you are using containerd, make sure docker isn't installed. `kubeadm` init will  try to auto detect the container runtime and at the moment it both are installed it will pick docker first

```bash
vagrant ssh c1-cp1
```

```bash
#0 - Creating a Cluster
#Create our kubernetes cluster, specify a pod network range matching that in calico.yaml! 
#Only on the Control Plane Node, download the yaml files for the pod network.
wget https://docs.projectcalico.org/manifests/calico.yaml
```

> To make our live more easy, we can edit files in host. By default, Vagrant will share your project directory (the directory with the Vagrantfile) to /vagrant.

```bash
#Look inside calico.yaml and find the setting for Pod Network IP address range CALICO_IPV4POOL_CIDR, 
#adjust if needed for your infrastructure to ensure that the Pod network IP
#range doesn't overlap with other networks in our infrastructure.
nano calico.yaml
```

This is the default value:

```yaml
# The default IPv4 pool to create on startup if none exists. Pod IPs will be
# chosen from this range. Changing this value after installation will have
# no effect. This should fall within `--cluster-cidr`.
# - name: CALICO_IPV4POOL_CIDR
#   value: "192.168.0.0/16"
```

All pods are going to be allocated IPs from that network range (`192.168.0.0/16`), so we wnat to make sure that network range doesn't overlap with other networks in our infrastructure. If it does, you can set that value here. We're going to stay with the default value.


```bash
#Generate a default kubeadm init configuration file...this defines the settings of the cluster being built.
#If you get a warning about how docker is not installed...this is OK to ingore and is a bug in kubeadm
#For more info on kubeconfig configuration files see: 
#    https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file
kubeadm config print init-defaults | tee ClusterConfiguration.yaml

```

Note that we get a warning because Docker is not installed, we can ignore that. Looking inside of the output of this `ClusterConfiguration` document, we see LocalAPIEndpoint

```yaml
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 1.2.3.4
  bindPort: 6443
```

This IP address `1.2.3.4` of the API server, so we're going to update that to our IP `172.16.94.10`. The next thing to notice is the node registration:

```yaml
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  name: node
  taints: null
```

We have to update this to `containerd`

```bash
#Inside default configuration file, we need to change four things.
#1. The IP Endpoint for the API Server localAPIEndpoint.advertiseAddress:
#2. nodeRegistration.criSocket from docker to containerd
#3. Set the cgroup driver for the kubelet to systemd, it's not set in this file yet, the default is cgroupfs
#4. Edit kubernetesVersion to match the version you installed in 0-PackageInstallation-containerd.sh
#5. Update the node name from node to the actual control plane node name, c1-cp1

#Change the address of the localAPIEndpoint.advertiseAddress to the Control Plane Node's IP address
sed -i 's/  advertiseAddress: 1.2.3.4/  advertiseAddress: 172.16.94.10/' ClusterConfiguration.yaml

#Set the CRI Socket to point to containerd
sed -i 's/  criSocket: \/var\/run\/dockershim\.sock/  criSocket: \/run\/containerd\/containerd\.sock/' ClusterConfiguration.yaml

#UPDATE: Added configuration to set the node name for the control plane node to the actual hostname
sed -i 's/  name: node/  name: c1-cp1/' ClusterConfiguration.yaml

#Set the cgroupDriver to systemd...matching that of your container runtime, containerd
cat <<EOF | cat >> ClusterConfiguration.yaml
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF
```

The las configuration is missing so we're appending  to the file

```bash
#Review the Cluster configuration file, update the version to match what you've installed. 
#We're using 1.21.0...if you're using a newer version update that here.
nano ClusterConfiguration.yaml

```

> We have to update to `1.21.4`

Finally `ClusterConfiguration.yaml` must look like this:

```yaml
apiVersion: kubeadm.k8s.io/v1beta2
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 172.16.94.10
  bindPort: 6443
nodeRegistration:
  criSocket: /run/containerd/containerd.sock
  name: c1-cp1
  taints: null
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns:
  type: CoreDNS
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: k8s.gcr.io
kind: ClusterConfiguration
kubernetesVersion: v1.21.4
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
scheduler: {}
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
```

Now we can bootstrap the cluster

```bash
#Need to add CRI socket since there's a check for docker in the kubeadm init process, 
#if you don't you'll get this error...
#   error execution phase preflight: docker is required for container runtime: exec: "docker": executable file not found in $PATH
sudo kubeadm init \
    --config=ClusterConfiguration.yaml \
    --cri-socket /run/containerd/containerd.sock

```

If the previous command has successed, we must see the following putput:

```bash
# ....
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 172.16.94.10:6443 --token abcdef.0123456789abcdef \
        --discovery-token-ca-cert-hash sha256:47780398ea95f472ba00996a6facbe27cb55b2fd3ba56d48389a4d071821979
```

```bash
#Before moving on review the output of the cluster creation process including the kubeadm init phases, 
#the admin.conf setup and the node join command


#Configure our account on the Control Plane Node to have admin access to the API server from a non-privileged account.
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Now it's time to deploy the pod network

```bash
#1 - Creating a Pod Network
#Deploy yaml file for your pod network. #May print a warning about PodDisruptionBudget it is safe to ignore for now.
kubectl apply -f calico.yaml
```

```bash
#Look for the all the system pods and calico pods to change to Running. 
#The DNS pod won't start (pending) until the Pod network is deployed and Running.
kubectl get pods --all-namespaces
```

Let's review the output of above command

```bash
NAMESPACE     NAME                                       READY   STATUS              RESTARTS   AGE
kube-system   calico-kube-controllers-58497c65d5-vlvkn   0/1     ContainerCreating   0          51s
kube-system   calico-node-8vhhb                          0/1     PodInitializing     0          51s
kube-system   coredns-558bd4d5db-kd9l5                   0/1     ContainerCreating   0          32m
kube-system   coredns-558bd4d5db-qvfmv                   0/1     ContainerCreating   0          32m
kube-system   etcd-c1-cp1                                1/1     Running             0          32m
kube-system   kube-apiserver-c1-cp1                      1/1     Running             0          32m
kube-system   kube-controller-manager-c1-cp1             1/1     Running             0          32m
kube-system   kube-proxy-rtdmt                           1/1     Running             0          32m
kube-system   kube-scheduler-c1-cp1                      1/1     Running             0          32m
```

We can see our control plane pods `etcd`, `apiserver`, `controler-manager` and `scheduler`. We can see also `kube-proxy`, that's going to implement service networking on this individual node.

Then we see `coredns` pods on status creating, what that means is those pods are out pulling the container images to start those pods up. We also see the calico pods on state of initializing.

```bash
#Gives you output over time, rather than repainting the screen on each iteration.
kubectl get pods --all-namespaces --watch
```

```bash
#All system pods should be Running
kubectl get pods --all-namespaces

```

If we wait enough time, we must see the following output

```bash
NAMESPACE     NAME                                       READY   STATUS    RESTARTS   AGE
kube-system   calico-kube-controllers-58497c65d5-vlvkn   1/1     Running   0          8m35s
kube-system   calico-node-8vhhb                          1/1     Running   0          8m35s
kube-system   coredns-558bd4d5db-kd9l5                   1/1     Running   0          40m
kube-system   coredns-558bd4d5db-qvfmv                   1/1     Running   0          40m
kube-system   etcd-c1-cp1                                1/1     Running   0          39m
kube-system   kube-apiserver-c1-cp1                      1/1     Running   0          39m
kube-system   kube-controller-manager-c1-cp1             1/1     Running   0          39m
kube-system   kube-proxy-rtdmt                           1/1     Running   0          40m
kube-system   kube-scheduler-c1-cp1                      1/1     Running   0          40m
```


```bash
#Get a list of our current nodes, just the Control Plane Node/Master Node...should be Ready.
kubectl get nodes 

```

The output of above command

```bash
NAME     STATUS   ROLES                  AGE   VERSION
c1-cp1   Ready    control-plane,master   42m   v1.21.4
```

```bash
#2 - systemd Units...again!
#Check out the systemd unit...it's no longer crashlooping because it has static pods to start
#Remember the kubelet starts the static pods, and thus the control plane pods
sudo systemctl status kubelet.service 
```


```bash
#3 - Static Pod manifests
#Let's check out the static pod manifests on the Control Plane Node
ls /etc/kubernetes/manifests
``` 

The above command prints out

```bash
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
```

```bash
#And look more closely at API server and etcd's manifest.
sudo more /etc/kubernetes/manifests/etcd.yaml
sudo more /etc/kubernetes/manifests/kube-apiserver.yaml

```

```bash
#Check out the directory where the kubeconfig files live for each of the control plane pods.
ls /etc/kubernetes

```

The output of above command

```bash
admin.conf  controller-manager.conf  kubelet.conf  manifests  pki  scheduler.conf
```


