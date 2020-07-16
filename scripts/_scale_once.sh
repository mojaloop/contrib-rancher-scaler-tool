#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HELM_ONCE_DIR="${DIR}/../helm-once"
ENV_FILE=${ENV_FILE:=${DIR}/../.env}
set -a; source ${ENV_FILE} ;set +a

set -u
set -e

helm install \
  --set secrets.CATTLE_SECRET_KEY=${CATTLE_SECRET_KEY} \
  --set secrets.RANCHER_BASE_URL=${RANCHER_BASE_URL} \
  --set secrets.SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL} \
  --set job.npmCommand=${1} \
  rancher-scaler-once ${HELM_ONCE_DIR} --dry-run