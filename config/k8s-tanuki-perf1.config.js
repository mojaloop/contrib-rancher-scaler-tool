const config = {
  // Global hooks.
  // At least `global: {}` is required
  global: {
    preScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling up `{{totalNodePools}}` node pools', color: 'warn' }
    ],
    postScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled up succesfully! 🎉🎉🎉', color: 'good' }
    ],
    preScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling down `{{totalNodePools}}` node pool in `10 minutes`\n\nRun:\n```kubectl patch cronjobs rancher-scaler-cron-down -p \'{ "spec": { "suspend": true } }\'```\n\n to stop this.', color: 'warn'},
      // Sleep to allow user intervention - Note: kubernetes will timeout the job after 10 minutes
      { hookType: 'SLEEP', timeMs: 1000 * 60 * 1 }
    ],
    postScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled down `{{totalNodePools}}` node pools! 🎉🎉🎉', color: 'good' }
    ],
    onFailure: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale', color: 'danger' }
    ]
  },
  nodes: [
    {
      nodePoolId: 'c-kbc2d:np-g8g95', //k8s-tanuki-ubuntu-node-c5.2xlarge
      nodeTemplateId: 'cattle-global-nt:nt-8tzlz', //c5.2xlarge
      minQuantity: 0,
      maxQuantity: 8,
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            rebootOnEnd: true,
            script:`
              echo "Downloading and running bootstrap script";
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_install_cloudwatch.sh -O /tmp/_install_cloudwatch.sh;
              #TODO: reenable checksum
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_install_cloudwatch.sh" | sha256sum --check;
              sudo bash /tmp/_install_cloudwatch.sh;
              `
          }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale `{{nodePoolId}}`' }
        ]
      }
    },
    {
      nodePoolId: 'c-kbc2d:np-2j8fl', //k8s-tanuki-ubuntu-node-c5.xlarge
      nodeTemplateId: 'cattle-global-nt:nt-l9jq8', //c5.xlarge
      minQuantity: 0,
      maxQuantity: 28,
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            rebootOnEnd: true,
            script:`
              echo "Downloading and running bootstrap script";
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_install_cloudwatch.sh -O /tmp/_install_cloudwatch.sh;
              #TODO: reenable checksum
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_install_cloudwatch.sh" | sha256sum --check;
              sudo bash /tmp/_install_cloudwatch.sh;
              `
          }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale `{{nodePoolId}}`' }
        ]
      }
    },
    {
      nodePoolId: 'c-kbc2d:np-mmb84', //k8s-tanuki-ubuntu-node-i3.xlarge
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-qsnss', //i3.xlarge
      minQuantity: 0,
      maxQuantity: 3,
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            rebootOnEnd: true,
            script:`
              echo "Downloading and running bootstrap script";
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_install_cloudwatch.sh -O /tmp/_install_cloudwatch.sh;
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_boostrap_nvme.sh -O /tmp/_bootstrap_nvme.sh;
              #TODO: reenable checksum
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_install_cloudwatch.sh" | sha256sum --check;
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
              sudo bash /tmp/_install_cloudwatch.sh;
              sudo bash /tmp/_bootstrap_nvme.sh
              `
          }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale `{{nodePoolId}}`' }
        ]
      }
    },
    {
      nodePoolId: 'c-kbc2d:np-9mclh', //k8s-tanuki-ubuntu-node-i3.2xlarge
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-kv54c', //i3.2xlarge
      minQuantity: 0,
      maxQuantity: 3,
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            rebootOnEnd: true,
            script:`
              echo "Downloading and running bootstrap script";
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_install_cloudwatch.sh -O /tmp/_install_cloudwatch.sh;
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_boostrap_nvme.sh -O /tmp/_bootstrap_nvme.sh;
              #TODO: reenable checksum
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_install_cloudwatch.sh" | sha256sum --check;
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
              sudo bash /tmp/_install_cloudwatch.sh;
              sudo bash /tmp/_bootstrap_nvme.sh
              `
          }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale `{{nodePoolId}}`' }
        ]
      }
    },
    {
      nodePoolId: 'c-kbc2d:np-d8bd4', //k8s-tanuki-ubuntu-node-r5.xlarge
      nodeTemplateId: 'cattle-global-nt:nt-wwf2g', //r5.xlarge
      minQuantity: 0,
      maxQuantity: 15,
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            rebootOnEnd: true,
            script:`
              echo "Downloading and running bootstrap script";
              wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_install_cloudwatch.sh -O /tmp/_install_cloudwatch.sh;
              #TODO: reenable checksum
              #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_install_cloudwatch.sh" | sha256sum --check;
              sudo bash /tmp/_install_cloudwatch.sh;
              `
          }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale `{{nodePoolId}}`' }
        ]
      }
    }
  ]
}

module.exports = config
