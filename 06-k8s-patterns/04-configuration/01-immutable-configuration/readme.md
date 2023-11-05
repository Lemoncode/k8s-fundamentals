# Immutable Configuration

Packages configuration data into an immutable container image and links the configuration container to the application at runtime.

## Immutable Configuration Use Cases

* We want that is not possible change the configuration after the application has started. 

This way we ensure always have a well-defined state for our configuration data.

## Demo: Immutable Docker

[Demo: Immutable Docker](00-immutable-docker/readme.md)

## Kubernetes Init Containers

In order to use `Immutable Configuration` we can use init containers.