FROM ghcr.io/graalvm/graalvm-ce:latest

WORKDIR /app
EXPOSE 8080
COPY ./ /app/

RUN ./mvnw package
ENTRYPOINT [ "./mvnw", "spring-boot:run" ]