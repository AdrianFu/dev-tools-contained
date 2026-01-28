# syntax=docker/dockerfile:1
FROM ubuntu:noble AS ubuntu-fat

RUN apt-get update && \
    apt-get -y install sudo curl ufw net-tools nano iputils-ping gnupg ca-certificates libatomic1


FROM ubuntu-fat AS node-fat

RUN --mount=type=secret,id=zscaler_cert,target=/usr/local/share/ca-certificates/ZscalerRootCA.crt \
    update-ca-certificates

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && \
    sudo apt-get install -y nodejs


FROM node-fat AS opencode-fat

RUN --mount=type=secret,id=zscaler_cert,target=/usr/local/share/ca-certificates/ZscalerRootCA.crt \
    NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/ZscalerRootCA.crt npm i -g opencode-ai@latest