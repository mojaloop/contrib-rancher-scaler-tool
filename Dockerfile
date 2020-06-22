FROM node:12.16.1-alpine as builder
WORKDIR /opt/rancher-scaler

COPY package.json package-lock.json* /opt/rancher-scaler/

RUN npm ci

COPY src /opt/rancher-scaler/src
COPY config /opt/rancher-scaler/config
COPY tsconfig.json /opt/rancher-scaler/tsconfig.json

FROM node:12.16.1-alpine
WORKDIR /opt/rancher-scaler

# SSH required for RUN_STARTUP_SCRIPT actions
RUN apk add --no-cache openssh

COPY --from=builder /opt/rancher-scaler .

# TODO: prune non production modules, this requires us to properly build ts


CMD ["npm", "run", "start"]
