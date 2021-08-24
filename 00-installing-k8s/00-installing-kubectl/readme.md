## Linux

[Installing on Linux](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)
[Upgrade to specific version](https://newbedev.com/how-to-upgrade-kubectl-client-version)

1. Download the latest release with command:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

For a specific version run:

```bash
curl -LO https://dl.k8s.io/release/v1.22.0/bin/linux/amd64/kubectl
```

2. Install kubectl

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Linux / macOS upgrade

```bash
#Reference: https://gist.github.com/qaiserali/18926b5bd9ca7a0551195d449bf31eb6
##  Step1: Run the below command to download the latest version of kubectl
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl

##  Step2: Make kubectl executable
chmod +x kubectl

##  Step3: Move it to the directory where kubectl is already installed
sudo mv kubectl $(which kubectl)
```

In our case, we're going to align with `EKS` current required version `1.21.0`

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.21.0/bin/linux/amd64/kubectl
```

Now we can follow the final steps

```bash
chmod +x kubectl

sudo mv kubectl $(which kubectl)
```

Run `kubectl version` to verify that we have successfully upgrade.

```
Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:31:21Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```