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

# TODO: install cloudwatch agent

# make sure this script is idempotent:
touch ${LOCKFILE}


## Rebooting system
echo "****** OS - Rebooting system..."
# TODO: renable once we fix pod scheduling issues
# reboot