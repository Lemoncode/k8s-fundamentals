## Introduction

If your on `Docker Desktop` we saw previously that is pretty easy to move to `K8s`, but if we are out `Docker Desktop`, this solution is not going to work. We can use a tool to go from `docker-compose` to `K8s` using a tool called `Kompose`. 

## Kompose Overview

> Kubernetes + Compose = Kompose

> Kompose is a tool to help users familiar with docker-compose move to K8s. It takes a Docker Compose file and translates it into K8s reosurces.

[Kompose official site](https://kompose.io)


By default generates `K8s Services` and `K8s Deployments`, but if we want we can specify other workloads, such as `DaemonSets`

Docker Compose Services ==> `Kompose` ==> K8s Services & K8s Deployments

It will create the needed services, to make that pods can communicate with each other. 

Also the default configuration, if it sees a volume on Docker Compose, it will convert that into a persistent volume and then generate the appropiate claiming.

## Installing Kompose

[kompose installation page](https://kompose.io/installation/)

```bash
# Linux
curl -L https://github.com/kubernetes/kompose/releases/download/v1.24.0/kompose-linux-amd64 -o kompose

# macOS
curl -L https://github.com/kubernetes/kompose/releases/download/v1.24.0/kompose-darwin-amd64 -o kompose

chmod +x kompose
sudo mv ./kompose /usr/local/bin/kompose

```

We can check the installation by just running `kompose`

```bash
 kompose
Kompose is a tool to help users who are familiar with docker-compose move to Kubernetes.

Usage:
  kompose [command]

Available Commands:
  completion  Output shell completion code
  convert     Convert a Docker Compose file
  help        Help about any command
  version     Print the version of Kompose

Flags:
      --error-on-warning    Treat any warning as an error
  -f, --file stringArray    Specify an alternative compose file
  -h, --help                help for kompose
      --provider string     Specify a provider. Kubernetes or OpenShift. (default "kubernetes")
      --suppress-warnings   Suppress all warnings
  -v, --verbose             verbose output

Use "kompose [command] --help" for more information about a command.
```

```bash
docker build -t kompose -f Kompose.Dockerfile .
```

```bash
docker run --rm -it -v `pwd`:/opt/app kompose
```

Inside container

```bash
mkdir convert
```

```bash
kompose --file test.yml convert --out ./result
```

## The kompose convert Command

### Getting Help with `kompose conver` Command

`kompose convert` provides several different flags that can be used.

Use the `--help` or `-h` flag with the command to get help.

```bash
# The conver command converts compose YAML to k8s YAML
kompose convert

# Getting help with the convert command
kompose convert --help
```

### Key *comopose convert* Flags

* `--file` - DEfine alternative compose file
* `--chart` - Create a Helm chart for converted objects
* `--json` - Generate JSON resource files
* `--out` - File name or directory where reosurces will be saved
* `--replicas` - Number of replicas in the generated resource spec (default=1)
* `--stdout` - Print converted objects to stdout
* `--volumes` - Volume type ("persistentVolumeClaim"|"emptyDir"|"hostPath"|"configMap")(default "persistentVolumeClaim")

### Using the `--file` Flag

Use the `--file` or `-f` flag to reference a non-default compose file name or to convert mutiple compose files 

```bash
# Converting a compose file witha a different name from the default
kompose convert --file docker-compose.prod.yml

# Multiple Docker Compose files can be defined
kompose convert --file docker-compose1.yml --file docker-compose2.yml
```

When we're using it with multiple docker compose files, if a key matches in the next one `overlays` the first one.

### Using kompose convert Output Flags

Flags such as `--stdout` and `--out` can be used to define where the generated Kubernetes resources are written.

```bash
# Write resources to stdout
kompose convert --stdout

# Write resources to a specific folder (must exist)
kompose convert --out ./output

# Write resource to a single file
kompose convert --out k8s.yml

# Write resources to a specific folder and use 3 replicas in Deployments
kompose convert --out ./output --replicas 3
```

## kompose conevert in Action

## Exploring the generated YAML

## References

[kompose.io](https://kompose.io/)

[kompose GitHub](https://github.com/kubernetes/kompose)

[kompose user guide](https://github.com/kubernetes/kompose/blob/master/docs/user-guide.md)
