From tianshufu/node18-fat as truffle

RUN npm install --global --quiet truffle

RUN echo '#!/bin/bash\ntruffle dashboard --no-auto-open --host 0.0.0.0' > /usr/bin/truffle-dashboard && \
    chmod +x /usr/bin/truffle-dashboard

WORKDIR /home/app

EXPOSE 24012

CMD ["truffle", "version"]
#CMD ["truffle-dashboard"]

