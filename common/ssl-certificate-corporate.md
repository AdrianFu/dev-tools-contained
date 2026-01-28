# Corporate Proxy & SSL Certificate Issues

## The Problem

Corporate networks often use **SSL/TLS inspection proxies** (e.g., Zscaler, Symantec, Bluecoat) that intercept HTTPS traffic. These proxies:

1. Terminate your HTTPS connection
2. Decrypt and inspect the traffic
3. Re-encrypt it using their own certificate
4. Forward it to the destination

This breaks the certificate chain of trust, causing tools to fail with errors like:

| Tool | Error |
|------|-------|
| `curl` | `curl: (60) SSL certificate problem: unable to get local issuer certificate` |
| `npm install` | `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` |
| `pip install` | `SSLError: [SSL: CERTIFICATE_VERIFY_FAILED]` |
| `git clone` (https) | `SSL certificate problem: unable to get local issuer certificate` |
| `apt-get update` | `Certificate verification failed` |

## The Solution

You must add the corporate proxy's root CA certificate to your trusted certificate store.

### On Windows

1. Obtain the corporate root CA certificate (e.g., `ZscalerRootCA.cer`).
   - Open `certlm.msc`
   - Go to **Trusted Root Certification Authorities > Certificates**
   - Look for "Zscaler Root CA". Right-click > All Tasks > Export (choose Base-64 encoded .cer or .pem)
   - Save it to a known location (e.g., `C:\Users\YourUser\.secrets\ZscalerRootCA.cer`).
2. Add the certificate to docker image build as shown in `common/Dockerfile` and `common/docker-compose.yml`.
3. When running containers, mount the certificate and set `NODE_EXTRA_CA_CERTS` environment variable as shown in `common/node18-fat-sh.bat`.