# Adding Worker Nodes to our Cluster

For this demo ssh into c1-node1

```bash
vagrant ssh c1-node1
```

```bash
# Disable all active swap
sudo swapoff -a

# Edit your fstab removing any entry for swap partitions . This keeps the swap off during reboot
# You can recover the space with fdisk. You may want to reboot to ensure your config is ok.
sudo sed -i 's/^[^#].*none.*swap.*sw/#&/' /etc/fstab

# Display the final configuration
cat /etc/fstab
```

Check the changes by running `cat /etc/fstab`

```bash
#0 - Joining Nodes to a Cluster

#Install a container runtime - containerd
#containerd prerequisites, first load two modules and configure them to load on boot
sudo modprobe overlay
sudo modprobe br_netfilter
```

```bash
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF
```

```bash
#Setup required sysctl params, these persist across reboots.
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF
```

```bash
#Apply sysctl params without reboot
sudo sysctl --system
```

The output of above command reflects the changes that we've already done

```bash
* Applying /etc/sysctl.d/10-console-messages.conf ...
kernel.printk = 4 4 1 7
* Applying /etc/sysctl.d/10-ipv6-privacy.conf ...
net.ipv6.conf.all.use_tempaddr = 2
net.ipv6.conf.default.use_tempaddr = 2
* Applying /etc/sysctl.d/10-kernel-hardening.conf ...
kernel.kptr_restrict = 1
* Applying /etc/sysctl.d/10-link-restrictions.conf ...
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
* Applying /etc/sysctl.d/10-lxd-inotify.conf ...
fs.inotify.max_user_instances = 1024
* Applying /etc/sysctl.d/10-magic-sysrq.conf ...
```

```bash
#Install containerd
sudo apt-get update
sudo apt-get install -y containerd
```

```bash
#Configure containerd
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
```

```bash
#Set the cgroup driver for containerd to systemd which is required for the kubelet.
#For more information on this config file see:
# https://github.com/containerd/cri/blob/master/docs/config.md and also
# https://github.com/containerd/containerd/blob/master/docs/ops.md

#At the end of this section
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
        ...
#UPDATE: This line is now in the config.toml file
#change it from SystemdCgroup = false to SystemdCgroup = true
            SystemdCgroup = true
```

Apply the above change using nano

```bash
sudo nano /etc/containerd/config.toml
```

```diff
#Set the cgroup driver for containerd to systemd which is required for the kubelet.
#For more information on this config file see:
# https://github.com/containerd/cri/blob/master/docs/config.md and also
# https://github.com/containerd/containerd/blob/master/docs/ops.md
# ......
 [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          base_runtime_spec = ""
          container_annotations = []
          pod_annotations = []
          privileged_without_host_devices = false
          runtime_engine = ""
          runtime_root = ""
          runtime_type = "io.containerd.runc.v2"

          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            BinaryName = ""
            CriuImagePath = ""
            CriuPath = ""
            CriuWorkPath = ""
            IoGid = 0
            IoUid = 0
            NoNewKeyring = false
            NoPivotRoot = false
            Root = ""
            ShimCgroup = ""
-           SystemdCgroup = false
+           SystemdCgroup = true
# ......
```

```bash
#Restart containerd with the new configuration
sudo systemctl restart containerd

```

```bash
#Install Kubernetes packages - kubeadm, kubelet and kubectl
#Add Google's apt repository gpg key
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
```

```bash
#Add the Kubernetes apt repository
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
```

```bash
#Update the package list
sudo apt-get update
apt-cache policy kubelet | head -n 20
```

```bash
#Install the required packages, if needed we can request a specific version.
#Pick the same version you used on the Control Plane Node in 0-PackageInstallation-containerd.sh
VERSION=1.25.2-00
sudo apt-get install -y kubelet=$VERSION kubeadm=$VERSION kubectl=$VERSION
sudo apt-mark hold kubelet kubeadm kubectl

#To install the latest, omit the version parameters
#sudo apt-get install kubelet kubeadm kubectl
#sudo apt-mark hold kubelet kubeadm kubectl

```

```bash

#Check the status of our kubelet and our container runtime.
#The kubelet will enter a crashloop until it's joined
systemctl status kubelet.service
systemctl status containerd.service
```

```bash
#Ensure both are set to start when the system starts up.
sudo systemctl enable kubelet.service
sudo systemctl enable containerd.service


#Log out of c1-node1 and back on to c1-cp1
exit
```

```bash
vagrant ssh c1-cp1
```

```bash
#On c1-cp1 - if you didn't keep the output, on the Control Plane Node, you can get the token.
kubeadm token list
```

```bash
#If you need to generate a new token, perhaps the old one timed out/expired.
kubeadm token create
```

```bash
#On the Control Plane Node, you can find the CA cert hash.
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'

#You can also use print-join-command to generate token and print the join command in the proper format
#COPY THIS INTO YOUR CLIPBOARD
kubeadm token create --print-join-command
```

The output of above command will change every time, we ask for a new token

```bash
kubeadm join 172.16.94.10:6443 --token q1na70.ubovfczdf10ek3lo --discovery-token-ca-cert-hash sha256:47780398ea95f472ba00996a6facbe27cb55b2fd3ba56d48389a4d0718219797
```

```bash
#Back on the worker node c1-node1, using the Control Plane Node (API Server) IP address or name, the token and the cert has, let's join this Node to our cluster.
vagrant ssh c1-node1
```

Use the token previously generated

```bash
#PASTE_JOIN_COMMAND_HERE be sure to add sudo
sudo kubeadm join 172.16.94.10:6443 \
 --token q1na70.ubovfczdf10ek3lo \
 --discovery-token-ca-cert-hash sha256:47780398ea95f472ba00996a6facbe27cb55b2fd3ba56d48389a4d0718219797

#Log out of c1-node1 and back on to c1-cp1
exit
```

The expected output for the above command is:

```bash
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```

```bash
vagrant ssh c1-cp1
```

```bash
# Back on Control Plane Node, this will say NotReady until the networking pod is created on the new node.
# Has to schedule the pod, then pull the container.
kubectl get nodes
```

```bash
# On the Control Plane Node, watch for the calico pod and the kube-proxy to change to Running on the newly added nodes.
kubectl get pods --all-namespaces --watch
```

```bash
# Still on the Control Plane Node, look for this added node's status as ready.
kubectl get nodes
```

```bash
# GO BACK TO THE TOP AND DO THE SAME FOR c1-node2 and c1-node3
# Just SSH into c1-node2 and c1-node3 and run the commands again.
vagrant ssh c1-node2
# You can skip the token re-creation if you have one that's still valid.
```

