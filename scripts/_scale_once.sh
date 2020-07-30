#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HELM_ONCE_DIR="${DIR}/../helm-once"
ENV_FILE=${ENV_FILE:=${DIR}/../.env}
set -a; source ${ENV_FILE} ;set +a

echo "Using Config File: ${PATH_TO_CONFIG}"

# set -u
# set -e

echo 'Cleaning up last Run'
helm --namespace ${K8S_NAMESPACE} del rancher-scaler-once || '[WARN] Non fatal error running `helm del rancher-scaler-once`'

echo "helm installing job of ${1}"
# Set these variables here so we don't have to maintain a values.yaml file containing secrets
helm --debug --namespace ${K8S_NAMESPACE} \
  install \
  --set-file config.config_js="${PATH_TO_CONFIG}" \
  --set job.env.CATTLE_ACCESS_KEY=${CATTLE_ACCESS_KEY} \
  --set secret.CATTLE_SECRET_KEY=${CATTLE_SECRET_KEY} \
  --set secret.RANCHER_BASE_URL=${RANCHER_BASE_URL} \
  --set secret.SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL} \
  --set job.npmCommand=${1} \
  rancher-scaler-once ${HELM_ONCE_DIR}

echo 
