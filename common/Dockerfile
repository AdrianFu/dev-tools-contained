FROM ubuntu:jammy as ubuntu-fat

RUN apt-get update && \
    apt-get -y install sudo curl ufw net-tools iputils-ping nano && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*
WORKDIR /home


FROM ubuntu-fat as jdk-fat

RUN apt-get update && \
    sudo apt-get -y install default-jdk && \
    sudo apt-get -y install gradle && \
    sudo apt-get -y install maven && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*
WORKDIR /home


FROM ubuntu-fat as node18-fat

# https://github.com/nodesource/distributions
RUN sudo apt-get update && \
    sudo apt-get install -y ca-certificates curl gnupg && \
    sudo mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    NODE_MAJOR=18 && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list && \
    sudo apt-get update && \
    sudo apt-get install nodejs -y && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*

WORKDIR /home


FROM node18-fat as angular-fat

RUN npm install -g @angular/cli


FROM python:3 as python3-kafka

RUN cd && printf '\n\n\nsource /python-env/kafka-env/bin/activate\n' >> .bashrc
WORKDIR /python-env
RUN /bin/bash -c 'pip install virtualenv && \
    virtualenv kafka-env && \
    source kafka-env/bin/activate && \
    pip install confluent-kafka && \
    pip install jsonschema && \
    pip install requests'
WORKDIR /home

FROM python:3 as yfinance

#RUN /bin/bash -c 'pip install pandas && pip install requests && pip install peewee && pip install appdirs && pip install bs4 && pip install frozendict && pip install multitasking'
RUN /bin/bash -c 'pip install pandas requests peewee appdirs bs4 frozendict multitasking yfinance requests_cache requests_ratelimiter pyrate_limiter'

WORKDIR /home

#ENTRYPOINT /bin/bash -c 'pwd'