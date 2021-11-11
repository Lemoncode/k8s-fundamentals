# Looking for Poor Configurations

## Installing trivy

```bash
brew install aquasecurity/trivy/trivy
```

We can also run it with Docker, that's what we're going to do on the following sections.

## Scanning image for vulnerabilities

```bash
 docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    -v $HOME/.cache:/root/.cache/ aquasec/trivy jaimesalas/greeting-app
```

```
2021-10-23T17:15:02.731Z        INFO    Need to update DB
2021-10-23T17:15:02.731Z        INFO    Downloading DB...
1.74 MiB / 24.45 MiB [---->__________________________________________________________] 7.12% ? p/s ?4.95 MiB / 24.45 MiB [------------>_________________________________________________] 20.24% ? p/s ?8.90 MiB / 24.45 MiB [---------------------->_______________________________________] 36.40% ? p/s ?12.29 MiB / 24.45 MiB [------------------------>_______________________] 50.25% 17.57 MiB p/s ETA 0s16.57 MiB / 24.45 MiB [-------------------------------->_______________] 67.76% 17.57 MiB p/s ETA 0s20.92 MiB / 24.45 MiB [----------------------------------------->______] 85.55% 17.57 MiB p/s ETA 0s24.45 MiB / 24.45 MiB [---------------------------------------------------] 100.00% 20.55 MiB p/s 1s2021-10-23T17:15:06.139Z    INFO    Detected OS: alpine
2021-10-23T17:15:06.139Z        INFO    Detecting Alpine vulnerabilities...
2021-10-23T17:15:06.139Z        INFO    Number of language-specific files: 1
2021-10-23T17:15:06.139Z        INFO    Detecting node-pkg vulnerabilities...

jaimesalas/greeting-app (alpine 3.11.12)
========================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)


Node.js (node-pkg)
==================
Total: 2 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 2, CRITICAL: 0)

+------------+------------------+----------+-------------------+---------------+--------------------------------------+
|  LIBRARY   | VULNERABILITY ID | SEVERITY | INSTALLED VERSION | FIXED VERSION |                TITLE                 |
+------------+------------------+----------+-------------------+---------------+--------------------------------------+
| ansi-regex | CVE-2021-3807    | HIGH     | 3.0.0             | 5.0.1, 6.0.1  | nodejs-ansi-regex: Regular           |
|            |                  |          |                   |               | expression denial of service         |
|            |                  |          |                   |               | (ReDoS) matching ANSI escape codes   |
|            |                  |          |                   |               | -->avd.aquasec.com/nvd/cve-2021-3807 |
+            +                  +          +-------------------+               +                                      +
|            |                  |          | 4.1.0             |               |                                      |
|            |                  |          |                   |               |                                      |
|            |                  |          |                   |               |                                      |
|            |                  |          |                   |               |                                      |
+------------+------------------+----------+-------------------+---------------+--------------------------------------+
```

## Looking for poor configurations

Create a new file `.docker/Dockerfile`, just cpoy the paste from previous example:

```Dockerfile
FROM node:14.18.0-alpine

COPY config.js .
COPY package.json .
COPY package-lock.json .
COPY server.js .

RUN npm ci 

CMD [ "node", "server.js" ]
```

> Note thate we're using the image recommended by Snyk

We can run it inside the container by specifying the root of the Dockerfile, `/home/app`:

```bash
docker run -v "$(pwd)"/.docker:/home/app -it --entrypoint /bin/sh aquasec/trivy
```

Or run it as workload, and observe the `stdout`

```bash
docker run -v "$(pwd)"/.docker:/home/app aquasec/trivy config /home/app
```

We get the following output:

```
2021-10-23T17:46:05.262Z        INFO    Need to update the built-in policies
2021-10-23T17:46:05.262Z        INFO    Downloading the built-in policies...
2021-10-23T17:46:06.925Z        INFO    Detected config files: 1

Dockerfile (dockerfile)
=======================
Tests: 23 (SUCCESSES: 22, FAILURES: 1, EXCEPTIONS: 0)
Failures: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)

+---------------------------+------------+-----------+----------+------------------------------------------+
|           TYPE            | MISCONF ID |   CHECK   | SEVERITY |                 MESSAGE                  |
+---------------------------+------------+-----------+----------+------------------------------------------+
| Dockerfile Security Check |   DS002    | root user |   HIGH   | Specify at least 1 USER                  |
|                           |            |           |          | command in Dockerfile with               |
|                           |            |           |          | non-root user as argument                |
|                           |            |           |          | -->avd.aquasec.com/appshield/ds002       |
+---------------------------+------------+-----------+----------+------------------------------------------+ 
```
