#!/bin/bash

set -xe

# Variable Declaration
KUBERNETES_VERSION=1.35.3-1.1

# Swap configuration
sudo swapoff -a
sudo sed -i 's/^[^#].*none.*swap.*sw/#&/' /etc/fstab

# Kernel modules configuration
sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

# Sysctl configuration
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sudo sysctl --system

# Containerd installation
sudo apt-get update
sudo apt-get install -y containerd

sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo sed -ri 's|(sandbox_image = ).*|\1"registry.k8s.io/pause:3.10.1"|' /etc/containerd/config.toml

sudo systemctl restart containerd

sudo apt-get install -y apt-transport-https ca-certificates curl gpg jq

# Kubernetes packages installation
curl -fsSL "https://pkgs.k8s.io/core:/stable:/v$(cut -d. -f1,2 <<<$KUBERNETES_VERSION)/deb/Release.key" | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v$(cut -d. -f1,2 <<<$KUBERNETES_VERSION)/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update

sudo apt-get install -y kubelet=$KUBERNETES_VERSION kubeadm=$KUBERNETES_VERSION kubectl=$KUBERNETES_VERSION
sudo apt-mark hold kubelet kubeadm kubectl

sudo systemctl enable --now kubelet.service
sudo systemctl enable --now containerd.service
