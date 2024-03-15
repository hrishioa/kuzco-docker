# Use an official Ubuntu base image
FROM nvidia/cuda:11.6.1-runtime-ubuntu20.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install curl
RUN apt-get update && apt-get install -y curl

# Run the Kuzco installation command
RUN curl -fsSL https://kuzco.xyz/install.sh | sh

RUN apt-get install -y unzip

RUN curl -fsSL https://bun.sh/install | bash

COPY runner/ ./kuzco_runner

RUN mkdir -p /home/samheutmaker/.kuzco/models/

CMD ["tail", "-f", "/kuzco_runner/kuzco_runner_logs.txt"]
