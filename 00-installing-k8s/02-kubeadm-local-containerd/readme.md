## Prerequisites

### Install Vagrant

### Installing on Linux

```bash
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vagrant
```

### How to install Vagrant on Ubuntu 22.04

[Article reference](https://linuxize.com/post/how-to-install-vagrant-on-ubuntu-20-04/)

```bash
curl -O https://releases.hashicorp.com/vagrant/2.4.9/vagrant_2.4.9-1_amd64.deb
```

```bash
sudo apt install ./vagrant_2.4.9-1_amd64.deb
```

## Start up VMs

Create `Vagrantfile`

```ruby
numWorkers = 1

Vagrant.configure("2") do |config|
  config.vm.provision "shell", inline: <<-SHELL
    apt-get update -y
    NUM_WORKERS=#{numWorkers}
    echo "172.16.94.10 c1-cp1" >> /etc/hosts
    for i in $(seq 1 $NUM_WORKERS); do
      echo "172.16.94.1${i} c1-node${i}" >> /etc/hosts
    done
  SHELL

  config.vm.define "c1-cp1" do |controlp|
    controlp.vm.box = "bento/ubuntu-22.04"
    controlp.vm.hostname = "c1-cp1"
    controlp.vm.network "private_network", ip: "172.16.94.10"
    controlp.vm.provider "virtualbox" do |vb|
      vb.memory = 4048
      vb.cpus = 2
    end
  end

  (1..numWorkers).each do |i|
    config.vm.define "c1-node#{i}" do |node|
      node.vm.box = "bento/ubuntu-22.04"
      node.vm.hostname = "c1-node#{i}"
      node.vm.network "private_network", ip: "172.16.94.1#{i}"
      node.vm.provider "virtualbox" do |vb|
        vb.memory = 2048
        vb.cpus = 1
      end
    end
  end
end

```

Let's try to start up the VMs

```bash
vagrant up
```

Now we can check connectivity by running:

```bash
vagrant ssh c1-cp1
```

```bash
vagrant ssh c1-node1
```

```bash
vagrant ssh c1-node2
```

```bash
vagrant ssh c1-node3
```

## References

[How to setup K8s cluster on VagrantVms](https://devopscube.com/kubernetes-cluster-vagrant/)
[How to setup K8s cluster using Kubeadm](https://devopscube.com/setup-kubernetes-cluster-kubeadm/)

## Troubleshooting

On last VirtualBox updates for Unix systems (macOS / Linux), we have to specify the allowed CIDR blocks that we're going to create for our VM's:

```bash
sudo mkdir -p /etc/vbox
sudo nano /etc/vbox/networks.conf
```

- Edit `/etc/vbox/networks.conf` with the following content:

```log
* 172.16.94.0/24
```

> Note: This is the CIDR range for the boxes that we're using on this demo. Ensure that don't overlap with your local network. In that case use a different CIDR block
