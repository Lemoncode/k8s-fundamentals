# Creating a Cluster Control Plane Node

> IMPORTANT: If you are using containerd, make sure docker isn't installed. `kubeadm` init will try to auto detect the container runtime and at the moment it both are installed it will pick docker first

```bash
vagrant ssh c1-cp1
```

### Creating a Cluster

```bash
# Create our kubernetes cluster, specify a pod network range matching that in calico.yaml!
# Only on the Control Plane Node, download the yaml files for the pod network.
wget https://docs.projectcalico.org/manifests/calico.yaml
```

> To make our live more easy, we can edit files in host. By default, Vagrant will share your project directory (the directory with the Vagrantfile) to /vagrant.

```bash
# Look inside calico.yaml and find the setting for Pod Network IP address range CALICO_IPV4POOL_CIDR,
# adjust if needed for your infrastructure to ensure that the Pod network IP
# range doesn't overlap with other networks in our infrastructure.
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

All pods are going to be allocated IPs from that network range (`192.168.0.0/16`), so we want to make sure that network range doesn't overlap with other networks in our infrastructure. If it does, you can set that value here. We're going to stay with the default value.

```bash
# Generate a default kubeadm init configuration file...this defines the settings of the cluster being built.
# If you get a warning about how docker is not installed...this is OK to ignore and is a bug in kubeadm
# For more info on kubeconfig configuration files see:
# https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file
kubeadm config print init-defaults > ClusterConfiguration.yaml
```

Note that we get a warning because Docker is not installed, we can ignore that. Looking inside of the output of this `ClusterConfiguration` document, we see LocalAPIEndpoint

```yaml
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 1.2.3.4
  bindPort: 6443
```

This IP address `1.2.3.4` of the API server, so we're going to update that to our IP `172.16.94.10`. The next thing to notice is the node registration.
In older kubeadm versions it `criSocket` pointed to `/var/run/dockershim.sock`. We need to be sure it points now to `containerd` socket.

```yaml
nodeRegistration:
  criSocket: unix:///var/run/containerd/containerd.sock
  imagePullPolicy: IfNotPresent
  name: node
  taints: null
```

```bash
# Inside default configuration file, we need to change four things.
# 1. The IP Endpoint for the API Server `localAPIEndpoint.advertiseAddress`
# 2. `nodeRegistration.criSocket` from docker to containerd
# 3. Set the cgroup driver for the kubelet to systemd. This is not set in this file yet. The default is cgroupfs. From version 1.22 the default is systemd
# 4. Edit `kubernetesVersion` to match the version you installed
# 5. Update the node name from node to the actual control plane node name, c1-cp1
# 6. Set the pod subnet CIDR to the same value of CALICO_IPV4POOL_CIDR from calico.yml adding `networking.podSubnet`

# Change the address of the localAPIEndpoint.advertiseAddress to the Control Plane Node's IP address
sed -ri 's|^(\s*advertiseAddress:).*|\1 172.16.94.10|' ClusterConfiguration.yaml

# Set the node name to the Control Plane Node hostname
sed -ri 's|^(\s*name:).*|\1 c1-cp1|' ClusterConfiguration.yaml

# Update `kubernetesVersion` to match our version:
sed -ri 's|^(\s*kubernetesVersion:).*|\1 1.25.2|' ClusterConfiguration.yaml

# Append after `serviceSubnet` the pod subnet CIDR
sed -ri 's|^(\s*)serviceSubnet:.*|&\n\1podSubnet: 192.168.0.0/16|' ClusterConfiguration.yaml

# Set the cgroupDriver to systemd...matching that of your container runtime, containerd
cat <<EOF >> ClusterConfiguration.yaml
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF
```

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
kubernetesVersion: v1.25.2
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 192.168.0.0/16
scheduler: {}
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
```

Now we can bootstrap the cluster

```bash
# Need to add CRI socket since there's a check for docker in the kubeadm init process,
# if you don't you'll get this error...
#   error execution phase preflight: docker is required for container runtime: exec: "docker": executable file not found in $PATH
sudo kubeadm init --config=ClusterConfiguration.yaml
```

If the previous command has succeeded, we must see the following output:

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

Before moving on review the output of the cluster creation process including the kubeadm init phases,
the admin.conf setup and the node join command

Configure our account on the Control Plane Node to have admin access to the API server from a non-privileged account.

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Now it's time to deploy the pod network

### Creating a Pod Network

Deploy yaml file for your pod network.
May print a warning about PodDisruptionBudget it is safe to ignore for now.

```bash
kubectl apply -f calico.yaml
```

The DNS pod won't start (pending) until the Pod network is deployed and Running.
Look for the all the system pods and calico pods to change to Running.

```bash
kubectl get pods --all-namespaces --watch
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

We can see our control plane pods `etcd`, `apiserver`, `controller-manager` and `scheduler`. We can see also `kube-proxy`, that's going to implement service networking on this individual node.

Then we see `coredns` pods on status creating, what that means is those pods are out pulling the container images to start those pods up. We also see the calico pods on state of initializing.

```bash
# Gives you output over time, rather than repainting the screen on each iteration.
kubectl get pods --all-namespaces --watch
```

```bash
# All system pods should be Running
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

Get a list of our current nodes, just the Control Plane Node/Master Node...should be Ready.

```bash
kubectl get nodes
```

The output of above command

```bash
NAME     STATUS   ROLES                  AGE   VERSION
c1-cp1   Ready    control-plane,master   42m   v1.25.2
```

Check out the systemd unit...it's no longer crash-looping because it has static pods to start
Remember the kubelet starts the static pods, and thus the control plane pods

```bash
systemctl status kubelet.service
```

Let's check out the static pod manifests on the Control Plane Node

```bash
ls /etc/kubernetes/manifests
```

The above command prints out

```bash
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
```

And look more closely at API server and etcd's manifest.

```bash
sudo more /etc/kubernetes/manifests/etcd.yaml
sudo more /etc/kubernetes/manifests/kube-apiserver.yaml
```

Check out the directory where the kubeconfig files live for each of the control plane pods.

```bash
ls /etc/kubernetes
```

The output of above command

```bash
admin.conf  controller-manager.conf  kubelet.conf  manifests  pki  scheduler.conf
```
