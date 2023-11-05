## Using an isolated VM - M1

Open `./.isolated-vm`, you will find a simple `Vagrantfile`, to spin up a the box, by running:

```bash
vagrant up
```

> TODO: Add instructions to install Docker

- https://docs.docker.com/engine/install/ubuntu/
- https://docs.docker.com/engine/install/linux-postinstall/

## Prerequisites

- Install [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)

We are going to install `minikube` as a binary:

```bash
curl -LO https://storage.googleapis.com/minikube/releases/v1.26.1/minikube-darwin-arm64
sudo install minikube-darwin-arm64 /usr/local/bin/minikube
```

> Notice that we're using `v1.26.1`, the latest one is actually `1.27.0`, but this version is tied to `Kubernetes 1.25` that has an open issue with `/etc/resolv.conf`.

## Linux

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

In our case we are going to install `1.21.0` to align with the required version by AWS EKS.

```bash
curl -LO https://storage.googleapis.com/minikube/releases/v1.21.0/minikube-linux-amd64
```

## Uninstall

```bash
minikube stop
minikube delete --all
rm -rf ~/.minikube
sudo rm -rf /usr/local/bin/minikube
```

## minikube Smoke Test

> Docker must be running on your machine as long as the default driver is Docker.

To verify that minikube it's working run:

```bash
minikube start
```

## Updgrade minikube Linux

```bash
# Remove the current cluster
minikube delete
# Remove binary
sudo rm -rf /usr/local/bin/minikube
# Install the desired version
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
## Verify installation
minikube start
```

## Adding Addons

```bash
# minikube must be running!!
minikube addons enable ingress
minikube addons enable dashboard
minikube addons enable metrics-server
```

## References

[minikube get started](https://minikube.sigs.k8s.io/docs/start/)
[how to uninstall minikube](https://stackoverflow.com/questions/66016567/how-to-uninstall-minikube-from-ubuntu-i-get-an-unable-to-load-cached-images-e#:~:text=First%2C%20run%20minikube%20delete%20to,can%20safely%20remove%20its%20binary.)
[how to upgrade minikube](https://stackoverflow.com/questions/45002364/how-to-upgrade-minikube)
