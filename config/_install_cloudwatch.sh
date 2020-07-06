#!/usr/bin/env bash

set -e
set -u

LOCKFILE=/root/has_cloudwatch_run
if test -f "${LOCKFILE}"; then
  echo "${LOCKFILE} exists. Not running _bootstrap_nvme again"
  exit 0
fi


echo "***** Installing CloudWatch Agent"
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ~/amazon-cloudwatch-agent.deb

echo "***** Configuring CloudWatch Agent"
# Config file is at: /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
# TODO: remove template once repo is public
wget -q -O amazon-cloudwatch-agent.json https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/amazon-cloudwatch-agent.json
mv amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/
echo "[DEBUG] creating cloudwatch script"
echo '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a start \
  -m ec2 \
  -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json' > _start_cloudwatch.sh
echo "[DEBUG] mv to /etc/init.d/"
mv _start_cloudwatch.sh /etc/init.d/
echo "[DEBUG] chmod 755"
chmod 755 /etc/init.d/_start_cloudwatch.sh

# Run now to verify
echo "[DEBUG] running /etc/init.d/_start_cloudwatch.sh"
/etc/init.d/_start_cloudwatch.sh

# make sure this script is idempotent:
touch ${LOCKFILE}
