FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

RUN apk add --no-cache coreutils dos2unix

COPY runner.sh /runner.sh
RUN dos2unix /runner.sh && chmod +x /runner.sh

ENTRYPOINT ["/runner.sh"]
