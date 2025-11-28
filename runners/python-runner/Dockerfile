FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache coreutils

COPY runner.sh /runner.sh
RUN chmod +x /runner.sh

ENTRYPOINT ["/runner.sh"]
