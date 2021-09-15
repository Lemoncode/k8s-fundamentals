# GraalVM

GraalVM is a high-performance JDK distribution designed to accelerate the execution of applicaction written in Java (and other JVM languages). Why GraalVM? It can provide beneficts by running Java apps faster, providing extensibility via scripting languages, or creating ahead-of-time compiled native images.

## Available distributions
- Enterprise edition -> based on Oracle JDK
- Community edition -> based on OpenJDK
- Support for Java 8, 11 and 16 (the GraalVM distribution based on Oracle JDK 16 is experimental)
- Available for Linux, macOS and Windows

## Components Lists

### Core Components
- **Runtimes**:
    - Java HotSpot VM
    - JavaScript runtime
    - LLVM runtime
- **Libraries** (JAR Files):
    - GraalVM compiler
    - Polyglot API (APIs for combining programming languages in a shared runtime)
- **Utilities**:
    - JavaScript REPL with the JavaScript interpreter
    - `lli` tool to directly execute programs from LLVM bitcode
    - [GraalVM Updater](https://www.graalvm.org/reference-manual/graalvm-updater/) to install additional functionalities

### Additional Components
GraalVM core installation can be extended with more languages runtimes and utilities.
- **Tools/Utilities**:
    - [Native Image](https://www.graalvm.org/reference-manual/native-image/)
    - [LLVM toolchain](https://www.graalvm.org/reference-manual/llvm/)
    - [Java on Truffle](https://www.graalvm.org/reference-manual/java-on-truffle/)
- **Runtimes**:
    - Node.js
    - Python
    - Ruby
    - R
    - GraalWasm

## Features support
The following table lists production-ready and experimental features in GraalVM Community Edition 21 by platform.

|     Feature     |  Linux AMD64 |  Linux ARM64  |     macOS    |    Windows    |
|:---------------:|:------------:|:-------------:|:------------:|:-------------:|
|   Native Image  |    stable    |     stable    |    stable    |     stable    |
|   LLVM runtime  |    stable    |     stable    |    stable    | not available |
|  LLVM toolchain |    stable    |     stable    |    stable    | not available |
|    JavaScript   |    stable    |     stable    |    stable    |     stable    |
|     Node.js     |    stable    |     stable    |    stable    |     stable    |
| Java on Truffle | experimental |  experimental | experimental |  experimental |
|      Python     | experimental | not available | experimental | not available |
|       Ruby      | experimental |  experimental | experimental | not available |
|        R        | experimental | not available | experimental | not available |
|   WebAssembly   | experimental |  experimental | experimental |  experimental |

#### Acknowledgements
- [GraalVm Documentation](https://www.graalvm.org/docs/introduction/)