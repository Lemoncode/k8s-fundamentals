FROM ghcr.io/graalvm/graalvm-ce:21.2.0

WORKDIR /app
EXPOSE 8080
COPY ./ /app/

RUN ./mvnw package
ENTRYPOINT [ "./mvnw", "spring-boot:run" ]