# Scanning Images Snyk

We start from this `Dockerfile`

```Dockerfile
FROM node:carbon-alpine

COPY config.js .
COPY package.json .
COPY package-lock.json .
COPY server.js .

RUN npm ci 

CMD [ "node", "server.js" ]
```

Generate local image

```bash
docker build -t jaimesalas/greeting-app .
```

Now that we have the built image, it's really easy `Snyk`, run:

```bash
docker scan jaimesalas/greeting-app
```

We get the following output:

```
Testing jaimesalas/greeting-app...

✗ Low severity vulnerability found in openssl/libcrypto1.1
  Description: Inadequate Encryption Strength
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1075739
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1j-r0

✗ Medium severity vulnerability found in openssl/libcrypto1.1
  Description: NULL Pointer Dereference
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1051931
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1i-r0

✗ Medium severity vulnerability found in openssl/libcrypto1.1
  Description: Integer Overflow or Wraparound
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1075737
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1j-r0

✗ Medium severity vulnerability found in openssl/libcrypto1.1
  Description: NULL Pointer Dereference
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1089241
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1k-r0

✗ Medium severity vulnerability found in openssl/libcrypto1.1
  Description: Information Exposure
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-544897
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1d-r3

✗ Medium severity vulnerability found in musl/musl
  Description: Out-of-bounds Write
  Info: https://snyk.io/vuln/SNYK-ALPINE311-MUSL-1042763
  Introduced through: musl/musl@1.1.24-r0, busybox/busybox@1.31.1-r8, alpine-baselayout/alpine-baselayout@3.2.0-r3, openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, zlib/zlib@1.2.11-r3, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0, busybox/ssl_client@1.31.1-r8, gcc/libgcc@9.2.0-r3, musl/musl-utils@1.1.24-r0, pax-utils/scanelf@1.2.4-r0, libc-dev/libc-utils@0.7.2-r0
  From: musl/musl@1.1.24-r0
  From: busybox/busybox@1.31.1-r8 > musl/musl@1.1.24-r0
  From: alpine-baselayout/alpine-baselayout@3.2.0-r3 > musl/musl@1.1.24-r0
  and 12 more...
  Fixed in: 1.1.24-r3

✗ High severity vulnerability found in openssl/libcrypto1.1
  Description: Integer Overflow or Wraparound
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1075738
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1j-r0

✗ High severity vulnerability found in openssl/libcrypto1.1
  Description: Improper Certificate Validation
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1089242
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1k-r0

✗ High severity vulnerability found in openssl/libcrypto1.1
  Description: Out-of-bounds Read
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1569447
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1l-r0

✗ High severity vulnerability found in openssl/libcrypto1.1
  Description: NULL Pointer Dereference
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-587980
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1g-r0

✗ High severity vulnerability found in gcc/libstdc++
  Description: Insufficient Entropy
  Info: https://snyk.io/vuln/SNYK-ALPINE311-GCC-598616
  Introduced through: gcc/libstdc++@9.2.0-r3, gcc/libgcc@9.2.0-r3
  From: gcc/libstdc++@9.2.0-r3
  From: gcc/libgcc@9.2.0-r3 > gcc/libstdc++@9.2.0-r3
  From: gcc/libgcc@9.2.0-r3
  Fixed in: 9.3.0-r0

✗ High severity vulnerability found in busybox/busybox
  Description: Improper Handling of Exceptional Conditions
  Info: https://snyk.io/vuln/SNYK-ALPINE311-BUSYBOX-1090152
  Introduced through: busybox/busybox@1.31.1-r8, alpine-baselayout/alpine-baselayout@3.2.0-r3, busybox/ssl_client@1.31.1-r8
  From: busybox/busybox@1.31.1-r8
  From: alpine-baselayout/alpine-baselayout@3.2.0-r3 > busybox/busybox@1.31.1-r8
  From: busybox/ssl_client@1.31.1-r8
  Fixed in: 1.31.1-r10

✗ High severity vulnerability found in apk-tools/apk-tools
  Description: Out-of-bounds Read
  Info: https://snyk.io/vuln/SNYK-ALPINE311-APKTOOLS-1246343
  Introduced through: apk-tools/apk-tools@2.10.4-r3
  From: apk-tools/apk-tools@2.10.4-r3
  Fixed in: 2.10.6-r0

✗ Critical severity vulnerability found in openssl/libcrypto1.1
  Description: Buffer Overflow
  Info: https://snyk.io/vuln/SNYK-ALPINE311-OPENSSL-1569451
  Introduced through: openssl/libcrypto1.1@1.1.1d-r2, openssl/libssl1.1@1.1.1d-r2, apk-tools/apk-tools@2.10.4-r3, libtls-standalone/libtls-standalone@2.9.1-r0
  From: openssl/libcrypto1.1@1.1.1d-r2
  From: openssl/libssl1.1@1.1.1d-r2 > openssl/libcrypto1.1@1.1.1d-r2
  From: apk-tools/apk-tools@2.10.4-r3 > openssl/libcrypto1.1@1.1.1d-r2
  and 4 more...
  Fixed in: 1.1.1l-r0

✗ Critical severity vulnerability found in apk-tools/apk-tools
  Description: Out-of-bounds Read
  Info: https://snyk.io/vuln/SNYK-ALPINE311-APKTOOLS-1534687
  Introduced through: apk-tools/apk-tools@2.10.4-r3
  From: apk-tools/apk-tools@2.10.4-r3
  Fixed in: 2.10.7-r0



Package manager:   apk
Project name:      docker-image|jaimesalas/greeting-app
Docker image:      jaimesalas/greeting-app
Platform:          linux/amd64
Base image:        node:8-alpine

Tested 16 dependencies for known vulnerabilities, found 15 vulnerabilities.

Base Image     Vulnerabilities  Severity
node:8-alpine  27               2 critical, 12 high, 11 medium, 2 low

Recommendations for base image upgrade:

Major upgrades
Base Image           Vulnerabilities  Severity
node:14.18.0-alpine  0                0 critical, 0 high, 0 medium, 0 low

Alternative image types
Base Image                  Vulnerabilities  Severity
node:14.18.1-bullseye-slim  35               1 critical, 0 high, 1 medium, 33 low
node:17.0.1-slim            35               1 critical, 0 high, 1 medium, 33 low
node:17.0.0-buster-slim     60               2 critical, 8 high, 6 medium, 44 low


For more free scans that keep your images secure, sign up to Snyk at https://dockr.ly/3ePqVcp
```

We get the summary of vulnerabilities, but the best part is the `Recoomendations`, let's update our `Dockerfile`, to use the best option.

Let's update the `Dockerfile` to use this one:

```diff
-FROM node:carbon-alpine
+FROM node:14.18.0-alpine

COPY config.js .
COPY package.json .
COPY package-lock.json .
COPY server.js .

RUN npm ci 

CMD [ "node", "server.js" ]
```

Let's build and scan again

```bash
docker build -t jaimesalas/greeting-app . && docker scan jaimesalas/greeting-app 
```

Now we get:

```
Testing jaimesalas/greeting-app...

Package manager:   apk
Project name:      docker-image|jaimesalas/greeting-app
Docker image:      jaimesalas/greeting-app
Platform:          linux/amd64
Base image:        node:14.18.0-alpine3.11

✓ Tested 16 dependencies for known vulnerabilities, no vulnerable paths found.

According to our scan, you are currently using the most secure version of the selected base image

For more free scans that keep your images secure, sign up to Snyk at https://dockr.ly/3ePqVcp
```

For last if we want a more detailed report, we can run:

```bash
docker scan -f Dockerfile jaimesalas/greeting-app
``` 

Even we can exclude the base image, and just focus on the layers that brings our code:

```bash
docker scan -f Dockerfile --exclude-base jaimesalas/greeting-app
```