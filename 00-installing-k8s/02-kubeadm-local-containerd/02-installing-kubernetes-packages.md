# Installing Kubernetes packages

Continuing from previous demo

Adding the repository to our system, so we can trust on it.

```bash
# Install K8s packages - kubeadm, kubelet and kubectl
# Add Google's apt repository gpg key
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
```

The next step is to add the K8s apt repository to our local repository list:

```bash
# Add the K8s apt repository
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
```

With this new repository added we want to update the repository metadata information

```bash
# Update the package list and use apt-cache policy to inspect versions available in the repository
sudo apt-get update
apt-cache policy kubelet | head -n 20
```

With this command `apt-cache policy kubelet | head -n 20` we can find out what is available to get

```bash
vagrant@c1-cp1:~$ apt-cache policy kubelet | head -n 20
kubelet:
  Installed: (none)
  Candidate: 1.25.2-00
  Version table:
     1.25.2-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.25.1-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.25.0-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.24.6-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.24.5-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.24.4-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.24.3-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
     1.24.2-00 500
        500 https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
```

We're going to install a specific version

```bash
VERSION=1.25.2-00
sudo apt-get install -y kubelet=$VERSION kubeadm=$VERSION kubectl=$VERSION
sudo apt-mark hold kubelet kubeadm kubectl
```

> Note: To install the latest omit the version parameters
>
> ```bash
> sudo apt-get install -y kubelet kubeadm kubectl
> sudo apt-mark hold kubelet kubeadm kubectl
> ```

Now let's have a look on systemd units

```bash
# Check the status of our kubelet and our container runtime, containerd
# The kubelet will enter a crashloop until a cluster is created or the node is joined to an existing cluster.
systemctl status kubelet.service
systemctl status containerd.service
```

One final step is to ensure that both of these services are set to start

```bash
#Ensure both are set to start when the system starts up.
sudo systemctl enable kubelet.service
sudo systemctl enable containerd.service
```
