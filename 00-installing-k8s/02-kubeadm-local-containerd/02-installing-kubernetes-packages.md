# Installing Kubernetes packages

Continuing from previous demo

Install required packages

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gpg jq
```

Adding the repository to our system, so we can trust on it.

```bash
# Install K8s packages - kubeadm, kubelet and kubectl
# Add Google's apt repository gpg key
KUBERNETES_VERSION=1.35.3-1.1
curl -fsSL "https://pkgs.k8s.io/core:/stable:/v$(cut -d. -f1,2 <<<$KUBERNETES_VERSION)/deb/Release.key" | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

The next step is to add the K8s apt repository to our local repository list:

```bash
# Add the K8s apt repository
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v$(cut -d. -f1,2 <<<$KUBERNETES_VERSION)/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list
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
  Candidate: 1.35.3-1.1
  Version table:
     1.35.3-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages
     1.35.2-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages
     1.35.1-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages
     1.35.0-1.1 500
        500 https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages
```

We're going to install a specific version

```bash
sudo apt-get install -y kubelet=$KUBERNETES_VERSION kubeadm=$KUBERNETES_VERSION kubectl=$KUBERNETES_VERSION
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
sudo systemctl enable --now kubelet.service
sudo systemctl enable --now containerd.service
```
