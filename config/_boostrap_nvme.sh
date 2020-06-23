#!/bin/bash

set -e
set -u

LOCKFILE=/root/has_boostrap_run
if test -f "${LOCKFILE}"; then
  echo "${LOCKFILE} exists. Not running _bootstrap_nvme again"
  exit 0
fi

echo "****** Rancher - Script to re-configure i3.xx AWS Machines to mount attached NVME storage!\n"

## Update OS
echo "****** OS - Updating"
apt-get -y update

## Install AWS OS extensions
echo "****** OS - Installing AWS OS extensions"
apt-get -y install linux-aws linux-headers-aws linux-image-aws

echo "***** Installing CloudWatch Agent"
wget https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ~/amazon-cloudwatch-agent.deb
# /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

echo "***** Configuring CloudWatch Agent"
wget -O amazon-cloudwatch-agent.json https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/amazon-cloudwatch-agent.json?token=AAM3EDGYP5VRMQJMODEJBU267KPM4
mv amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/
echo '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a start \
  -m ec2 \
  -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json' > _start_cloudwatch.sh
mv _start_cloudwatch.sh /etc/init.d/
chmod 755 /etc/init.d/_start_cloudwatch.sh

# Run now to verify
/etc/init.d/_start_cloudwatch.sh

# # TODO: testing only - remove later
# touch ${LOCKFILE}
# exit 0

## Stop Docker
echo "****** OS - Stopping Docker"
/etc/init.d/docker stop

## Format nvme storage
echo "****** NVME - Formating storage"
mkfs.ext4 /dev/nvme0n1 -F

## Mount nvme
echo "****** NVME - Mounting storage"
echo '/dev/nvme0n1  /mnt/nvme           ext4   defaults,discard 0 0' >> /etc/fstab
mkdir /mnt/nvme
mount /mnt/nvme

## Move & Mount Docker
echo "****** Docker - Re-configurating directory and mounts..."
mv /var/lib/docker /mnt/nvme/docker
mkdir /var/lib/docker

echo '/mnt/nvme/docker  /var/lib/docker    none   defaults,bind 0 0' >> /etc/fstab
mount /mnt/nvme/docker

## Move & Mount Kubelet
echo "****** Kubelet - Re-configurating directory and mounts..."
umount $(mount | grep kubelet | grep tmpfs | grep /var/lib | awk '{print $3}')
mv /var/lib/kubelet /mnt/nvme/kubelet
mkdir -p /var/lib/kubelet

echo '/mnt/nvme/kubelet  /var/lib/kubelet   none   defaults,bind 0 0' >> /etc/fstab
mount /mnt/nvme/kubelet

# make sure this script is idempotent:
touch ${LOCKFILE}

## Rebooting system
echo "****** OS - Rebooting system..."
# TODO: renable once we fix pod scheduling issues
# reboot