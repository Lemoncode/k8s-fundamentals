
## Linux

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

In our case we are going to install `1.21.0` to align with the required version by AWS EKS.

```bash
curl -LO https://storage.googleapis.com/minikube/releases/v1.21.0/minikube-linux-amd64
```

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
