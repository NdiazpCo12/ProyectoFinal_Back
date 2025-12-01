FROM gcc:latest

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends coreutils dos2unix && rm -rf /var/lib/apt/lists/*

COPY runner.sh /runner.sh
RUN dos2unix /runner.sh && chmod +x /runner.sh

ENTRYPOINT ["/runner.sh"]
