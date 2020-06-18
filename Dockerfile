FROM node:12.16.1-alpine as builder
WORKDIR /opt/rancher-scaler

# RUN apk add --no-cache -t build-dependencies git make gcc g++ python libtool autoconf automake \
#   && cd $(npm root -g)/npm \
#   && npm config set unsafe-perm true \
#   && npm install -g node-gyp

COPY package.json package-lock.json* /opt/rancher-scaler/

RUN npm install

COPY src /opt/rancher-scaler/src
COPY config /opt/rancher-scaler/config
COPY tsconfig.json /opt/rancher-scaler/tsconfig.json

FROM node:12.16.1-alpine
WORKDIR /opt/rancher-scaler

# TODO: prune non production modules, this requires us to properly build ts

COPY --from=builder /opt/rancher-scaler .

CMD ["npm", "run", "start"]
