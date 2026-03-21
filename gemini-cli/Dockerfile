ARG BASE_IMAGE=tianshufu/node-fat:latest
FROM ${BASE_IMAGE} AS gemini-fat

ARG GEMINI_VERSION

USER root
WORKDIR /

RUN npm install -g @google/gemini-cli@${GEMINI_VERSION}

ENV TERM=xterm-256color
ENV COLORTERM=truecolor

RUN --mount=type=bind,source=.gemini,target=/tmp/.gemini \
    cp -r /tmp/.gemini /home/vscode/.gemini && \
    chown -R vscode:vscode /home/vscode/.gemini

USER vscode
WORKDIR /home/vscode/app