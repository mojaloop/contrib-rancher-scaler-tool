#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HELM_ONCE_DIR="${DIR}/../helm-once"
ENV_FILE=${ENV_FILE:=${DIR}/../.env}
DRY_RUN_FLAG=${DRY_RUN_FLAG:="--dry-run"}
set -a; source ${ENV_FILE} ;set +a

echo "${PATH_TO_CONFIG}"

set -u
set -e

helm install \
  --set-file config.config_js="${PATH_TO_CONFIG}" \
  --set secret.CATTLE_SECRET_KEY=${CATTLE_SECRET_KEY} \
  --set secret.RANCHER_BASE_URL=${RANCHER_BASE_URL} \
  --set secret.SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL} \
  --set job.npmCommand=${1} \
  rancher-scaler-once ${HELM_ONCE_DIR} ${DRY_RUN_FLAG}
