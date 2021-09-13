# Running on local

In this example a Java application will be executed with GraalVM locally.

## System requirements
The computer used for this example is a GCP VM (machine type _e2-custom_) with the following technical details:
- OS: Ubuntu 18.04.1 LTS
- CPU: 1x Intel(R) Xeon(R) CPU @ 2.30GH
- Memory: 4,5GB

## Installing GraalVM
Version 21.2.0 based on Java 11 has been used. First of all it is necessary to download it from [GraalVM's Github](https://github.com/graalvm/graalvm-ce-builds/releases/tag/vm-21.2.0) and install it.

```bash
$ wget https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-21.2.0/graalvm-ce-java11-linux-amd64-21.2.0.tar.gz
$ tar -xzf graalvm-ce-java11-linux-amd64-21.2.0.tar.gz
$ export PATH=/path/to/graalvm-ce-java11-21.2.0/bin:$PATH
$ export JAVA_HOME=/path/to/graalvm-ce-java11-21.2.0
```

Now we can check if installation went well running `java --version` command.
```bash
$ java --version
> openjdk 11.0.12 2021-07-20
> OpenJDK Runtime Environment GraalVM CE 21.2.0 (build 11.0.12+6-jvmci-21.2-b08)
> OpenJDK 64-Bit Server VM GraalVM CE 21.2.0 (build 11.0.12+6-jvmci-21.2-b08, mixed mode, sharing)
$ js --version
> GraalVM JavaScript (GraalVM CE Native 21.2.0)
$ lli --version
> LLVM 10.0.0 (GraalVM CE Native 21.2.0)
```

## Running a simple HelloWorld
Create a `HelloWorld.java` file with the content below:

```java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
```

Compile it (`javac HelloWorld.java`) and execute it (`java HelloWorld`).

## Running a Spring application

A simple Spring application has been developed and it is located under folder [salary](./salary).
It has only one single endpoint (**/api/salary**) that generates a random number between 1500 and 2500 and returns a JSON object similar to this one: _{"salary":2192}_

In order to compile and run the API, please execute commands described below:
```bash
$ ./mvnw package
$ ./mvnw spring-boot:run
```

Now it is possible to make an HTTP request to the API. With a command line, use `curl http://$API_URL:8080/api/salary`.