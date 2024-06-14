#!/bin/bash

# disable swap
sudo swapoff -a
# keeps the swaf off during reboot
sudo sed -i 's/^[^#].*none.*swap.*sw/#&/' /etc/fstab

sudo apt-get update
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Following configurations are recomended in the kubenetes documentation for Docker runtime. Please refer https://kubernetes.io/docs/setup/production-environment/container-runtimes/#docker

cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl restart docker

echo "Docker Engine Configured Successfully"

CRI_DOCKERD_VERSION=$(curl -s https://api.github.com/repos/Mirantis/cri-dockerd/releases/latest| grep tag_name | cut -d '"' -f 4 | sed 's/v//g')
curl -fsSLO https://github.com/Mirantis/cri-dockerd/releases/download/v${CRI_DOCKERD_VERSION}/cri-dockerd-${CRI_DOCKERD_VERSION}.amd64.tgz
tar xvf cri-dockerd-${CRI_DOCKERD_VERSION}.amd64.tgz
sudo mv cri-dockerd/cri-dockerd /usr/local/bin/

curl -fsSLO https://raw.githubusercontent.com/Mirantis/cri-dockerd/v${CRI_DOCKERD_VERSION}/packaging/systemd/cri-docker.service
curl -fsSLO https://raw.githubusercontent.com/Mirantis/cri-dockerd/v${CRI_DOCKERD_VERSION}/packaging/systemd/cri-docker.socket
sudo mv cri-docker.socket cri-docker.service /etc/systemd/system/
sudo sed -i -e 's,/usr/bin/cri-dockerd,/usr/local/bin/cri-dockerd,' /etc/systemd/system/cri-docker.service
sudo systemctl daemon-reload
sudo systemctl enable cri-docker.service
sudo systemctl enable --now cri-docker.socket

echo "Docker Container Runtime Interface installed: $(cri-dockerd --version)"

sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg

echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

KUBERNETES_VERSION=1.25.4-00
sudo apt-get update
sudo apt-get install -y kubelet=$KUBERNETES_VERSION kubectl=$KUBERNETES_VERSION kubeadm=$KUBERNETES_VERSION
# reference https://stackoverflow.com/questions/49721708/how-to-install-specific-version-of-kubernetes
sudo apt-mark hold kubelet kubeadm kubectl

IPADDR="10.0.0.10"
NODENAME=$(hostname -s)

kubeadm config print init-defaults > ClusterConfiguration.yaml

sed -ri "s|^(\s*advertiseAddress:).*|\1 ${IPADDR}|" ClusterConfiguration.yaml
sed -ri "s|^(\s*name:).*|\1 ${NODENAME}|" ClusterConfiguration.yaml
sed -ri "s|^(\s*kubernetesVersion:).*|\1 ${KUBERNETES_VERSION%-*}|" ClusterConfiguration.yaml
sed -ri "s|^(\s*criSocket:).*|\1 unix:///run/cri-dockerd.sock|" ClusterConfiguration.yaml
sed -ri 's|^(\s*)serviceSubnet:.*|&\n\1podSubnet: 192.168.0.0/16|' ClusterConfiguration.yaml

# Set the cgroupDriver to systemd...matching that of your container runtime, containerd
cat <<EOF >> ClusterConfiguration.yaml
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF

sudo kubeadm init --config=ClusterConfiguration.yaml

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

curl -fsSLO https://docs.projectcalico.org/manifests/calico.yaml

kubectl apply -f calico.yaml
