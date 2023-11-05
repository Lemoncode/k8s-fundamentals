#!/bin/bash

/bin/bash /vagrant/configs/join.sh -v

sudo -i -u vagrant bash << 'EOF'
mkdir -p $HOME/.kube
sudo cp /vagrant/configs/config $HOME/.kube
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl label node $(hostname -s) node-role.kubernetes.io/worker=worker-new
EOF
