From ubuntu:jammy as ubuntu-fat

RUN apt-get update && \
    apt-get -y install sudo curl ufw net-tools && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*


From ubuntu-fat as node18-fat

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
    sudo apt-get install -y nodejs