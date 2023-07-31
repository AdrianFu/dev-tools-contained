From tianshufu/node18-fat as truffle

#RUN apt-get update && \
#    apt-get install --no-install-recommends -y \
#        build-essential \
#        python3 && \
#    apt-get install --no-install-recommends -y 
#    rm -fr /var/lib/apt/lists/* && \
#    rm -rf /etc/apt/sources.list.d/*


RUN npm install --global --quiet truffle ganache

RUN echo '#!/bin/bash\ntruffle dashboard --no-auto-open --host 0.0.0.0' > /usr/bin/truffle-dashboard && \
    chmod +x /usr/bin/truffle-dashboard

RUN echo '#!/bin/bash\nganache-cli --host 0.0.0.0' > /usr/bin/ganache-start && \
    chmod +x /usr/bin/ganache-start

WORKDIR /home/app

EXPOSE 8545
EXPOSE 24012

CMD ["truffle", "version"]



From truffle as ganache

