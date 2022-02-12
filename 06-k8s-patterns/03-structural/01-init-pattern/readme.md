# Init Pattern

Inside a `Pod` we can define `initContainers` entry, this give us the chance to declare a set of containers that will run sequentally before the pod's containers start.

- Run before app containers
- Complete before app containers start
- Run in order
- Pod restarts if init container fails
- Run idempotent code

> Init containers inside `initContainers` array, don't run in parallel.

> If an init container fails, the pod will be restarted, so the init containers will run again, is essential, that the code that run these containers are `IDEMPOTENT`

> Init containers, should not request more resources than the app containers, the scheduler will count the highest.

## Init Container Demo

[Init Container Demo](01-init-pattern/01-init-container/readme.md)

## Init Git Container Demo
