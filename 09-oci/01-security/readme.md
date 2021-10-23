# Container Security

## What is Container Security?

Container security is the process of securing containers against malware, data leaks, and other threats at all stages of the container lifecycle. From the time when you build your container image, to when you load it into a registry, to when you deploy it into a production environment, you should implement tools and processes to ensure that the container is secured against potential threats.

## Common Threats to Container Secuirty

### Container Malware

Malware is malicious code that is deployed within a container. It can sneak into containers at multiple stages of the container lifecycle.

1. Attacker compromises CI/CD environment.
2. Attacker gets access to container registry and replace our images.
3. Users downloa malicious container images. 

In all cases, malware that is not detected before a container is launched will enter your runtime environment, which could lead to any number of security issues, such as collecting sensitive data from an application or disrupting other containers.

### Insecure Container Privileges

Typically, containers should run in unprivileged mode, which means they don’t have access to any resources outside of the containerized environment that they directly control. 

Communications between containers should also be restricted unless the containers have a reason to communicate with each other.

When containers are allowed to run with more privileges than they strictly require, security risks result. 

Insecure privileges are usually caused by problematic configurations with the container orchestrator. The orchastrator platform grants more priveleges to the containers, due to poor configuration.

### Containers with Sensitive Data

Wrap organization's sensitive information into conatiners. For example, code that's private, and make it public, because we publish the container image as public.

## Managing Security Accross the Container Lifecycle

Implement security controls that protect containers at all stages of the container lifecycle.

### The Development Pipeline

Implementing access controls for development tools and enforcing the principle of least privilege helps to prevent this risk. So does scanning source code for malware prior to building and shipping it.

[Tools for scanning code for malware](https://geekflare.com/website-malware-scanning/)

### Container Images

If the contents of a container image include malware or sensitive data, the containers that are created from the image will be insecure.

As noted above, you should scan your internal source code to help ensure that malware doesn’t make its way into your container images.

However, container images often include resources imported from third-party sources, scanning your own code is not enough. 

You should also scan the entire container image using a container scanner, which will assess the image contents and flag any components that are known to be insecure. 

Image scanning can’t detect every type of threat (in particular, custom malware that has not yet been recorded in vulnerability databases may elude detection), but they will alert you to the majority of known threats.


### Container Registries

After container images are created, they are usually stored in a container registry, from which users can download them.

There are a few best practices to follow to address registry security. 

First, you should enforce access controls to ensure that only authorized users can access the images in your registry. 

Second, audit registries regularly so you know which images they contain. Outdated images that contain obsolete versions of an application should be removed in order to minimize your attack surface.

Finally, when working with container images from third-party registries, be sure that you trust the source. 

Attackers deliberately upload malicious images with names (like mysqlimage or nginxapp) that are designed to attract unsuspecting users. Avoid pulling images from any unofficial public registry, and be sure to scan all images no matter how much confidence you have in the organization that created them.

### Container Runtime Environment

The final stage of the container lifecycle is runtime. This is when containers are deployed into a live environment using container images that were downloaded from a registry.

Runtime security is one of the most complex aspects of container security because it involves multiple moving pieces, which can vary depending on which type of container application stack you use. In most cases, however, runtime security is based on securing:

* **The container runtime**: This is the process on the server that actually executes containers. You should ensure that your runtime software is up-to-date and patched against known security vulnerabilities.

* **The orchestrator**: The container orchestrator deploys and manages containers. Most orchestrators offer a variety of tools to help restrict containers’ privileges and minimize security risks, but you should also use third-party monitoring and analysis tools to help detect security issues at the orchestrator level.

* **Nodes**: Nodes are the servers that host containers. You need to secure the node operating system, user accounts, networking configurations, and other resources in order to ensure that a breach at the node level doesn’t allow attackers to impact your container environment.

### Continous Container Security

The container lifecycle is a circular, continuous process. After containers for a given application have been deployed into a runtime environment, the cycle starts anew when the application is updated, which leads to a new set of containers being pushed down the pipeline. Each new container could contain new risks.

Thus, container security is never a set-it-and-forget-it affair. You must continuously monitor for risks across the container lifecycle, while also updating your monitoring tools, vulnerability databases, and configurations to ensure that you continue to adhere to best practices for container security as your environment evolves.

## Demo: Scanning Image Snyk

## Demo: Scanning Images Snyk

## References

[What Is Container Security](https://sysdig.com/learn-cloud-native/container-security/what-is-container-security/)
[Searching for vulnerabilities: Snyk](https://www.returngis.net/2021/09/buscar-vulnerabilidades-en-imagenes-de-docker-con-snyk/)
