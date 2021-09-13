# Container

In this case, the Spring application developed previously will be containerized.

### GraalVM Community Images
To support container-based development, GraalVM Community container images for each release are published in the [GitHub Container Registry](https://github.com/graalvm/container/pkgs/container/graalvm-ce). One of those images will be the base image in our [Dockerfile](../salary/Dockerfile)

### Dockerfile
The Dockerfile shown below describes the image we need:
- Since we are running a Spring REST API, it is necessary to export port 8080.
- All the source code of the application is copied into the container under folder **/app**.
- To compile the code: `./mvnw package`
- To execute the REST API: `./mvnw spring-boot:run`

```Dockerfile
FROM ghcr.io/graalvm/graalvm-ce:21.2.0

WORKDIR /app
EXPOSE 8080
COPY ./ /app/

RUN ./mvnw package
ENTRYPOINT [ "./mvnw", "spring-boot:run" ]
```

### Building the Docker image
```bash
$ cd ../salary
$ docker build . -t jtrillo/testing-graalvm
```

### Running the container
```bash
$ docker run -d -p 8080:8080 --name pruebas-graalvm jtrillo/testing-graalvm
```

### Accessing container terminal
```bash
$ docker exec -it pruebas-graalvm bash
```
Now it is possible to check Java version on container terminal: `java --version`

#### Useful links
- [Container images - GraalVM](https://www.graalvm.org/docs/getting-started/container-images/)