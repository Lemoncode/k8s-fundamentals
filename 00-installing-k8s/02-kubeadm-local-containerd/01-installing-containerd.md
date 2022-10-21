# Installing containerd

## Setup

1. 4 VMs Ubuntu 20.04, 1 control plane, 3 nodes
2. Static IPs on individual VMs
3. /etc/hosts/ hosts file includes name to IP mappings for VMs
4. Swap is disabled

## Steps

Start the VMs `vagrant up`

Connect to master node

```bash
vagrant ssh c1-cp1
```

### Disable swap

This is something that we have to do on every node on our cluster.

```bash
# Disable all active swap
sudo swapoff -a

# Edit your fstab removing any entry for swap partitions . This keeps the swap off during reboot
# You can recover the space with fdisk. You may want to reboot to ensure your config is ok.
sudo sed -i 's/^[^#].*none.*swap.*sw/#&/' /etc/fstab

# Display the final configuration
cat /etc/fstab
```

After this the swap will be disabled because this line is commented out. Now we can move forward to the installation of `containerd`. By now it's a complex process.

### Containerd setup

```bash
# Load these two modules
# https://kubernetes.io/docs/setup/production-environment/container-runtimes/
sudo modprobe overlay
sudo modprobe br_netfilter

# We ensure that the modules are loaded when the system reboots creating next file
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF
```

We also need to configure some `sysctl` parameters

```bash
# Setup required sysctl params, these persist across reboots.
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF
```

With the above file created, we can apply that configuration

```bash
#Apply sysctl params without reboot
sudo sysctl --system
```

Now those configurations that were in that file are applied to the running system. With those configurations complete, both the modules and the sysctl parameters set, it's tim to install containerd

```bash
# Sync up repos and install containerd
sudo apt-get update
sudo apt-get install -y containerd
```

With `containerd` installed we have to add some configuration

```bash
#Create a containerd configuration file
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```

Inside the above configuration file will be the configuration attributes for `containerd`. We're pretty good with the defaults except for one change. We need to change the cgroup driver of containerd to systemd, we have to change `SystemdCgroup = false` to `SystemdCgroup = true`

```diff
# Set the cgroup driver for containerd to systemd which is required for the kubelet.
# For more information on this config file see:
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

Now we can restart `containerd` with the new configuration

```bash
#Restart containerd with the new configuration
sudo systemctl restart containerd
```
