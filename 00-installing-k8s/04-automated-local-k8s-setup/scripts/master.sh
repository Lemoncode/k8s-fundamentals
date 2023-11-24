#!/bin/bash

IPADDR="10.0.0.10"
NODENAME=$(hostname -s)
POD_CIDR="192.168.0.0/16"

kubeadm config print init-defaults > ClusterConfiguration.yaml

sed -ri "s|^(\s*advertiseAddress:).*|\1 ${IPADDR}|" ClusterConfiguration.yaml
sed -ri "s|^(\s*name:).*|\1 ${NODENAME}|" ClusterConfiguration.yaml
sed -ri "s|^(\s*kubernetesVersion:).*|\1 ${KUBERNETES_VERSION%-*}|" ClusterConfiguration.yaml
sed -ri "s|^(\s*criSocket:).*|\1 unix:///run/cri-dockerd.sock|" ClusterConfiguration.yaml
sed -ri "s|^(\s*)serviceSubnet:.*|&\n\1podSubnet: ${POD_CIDR}|" ClusterConfiguration.yaml

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

# Save Configs to shared /Vagrant location

# For Vagrant re-runs, check if there is existing configs in the location and delete it for saving new configuration.

config_path="/vagrant/configs"

if [ -d $config_path ]; then
   rm -f $config_path/*
else
   mkdir -p /vagrant/configs
fi

cp /etc/kubernetes/admin.conf /vagrant/configs/config
touch /vagrant/configs/join.sh
chmod +x /vagrant/configs/join.sh

echo "$(kubeadm token create --print-join-command) --cri-socket unix:///run/cri-dockerd.sock" > /vagrant/configs/join.sh

# Install Calico Network Plugin

kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# Install Metrics Server

kubectl apply -f https://raw.githubusercontent.com/scriptcamp/kubeadm-scripts/main/manifests/metrics-server.yaml

# Install Kubernetes Dashboard

KUBERNETES_DASHBOARD_VERSION=$(curl -s https://api.github.com/repos/kubernetes/dashboard/releases/latest | grep tag_name | cut -d '"' -f 4 | sed 's/v//g')
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v${KUBERNETES_DASHBOARD_VERSION}/aio/deploy/recommended.yaml

# Create Dashboard User

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
EOF

cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

kubectl -n kubernetes-dashboard create token admin-user > /vagrant/configs/token

sudo -i -u vagrant bash << 'EOF'
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
EOF
