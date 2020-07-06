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
      // { hookType: 'SLEEP', timeMs: 1000 * 60 * 1 }
    ],
    postScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled down `{{totalNodePools}}` node pools! 🎉🎉🎉', color: 'good' }
    ],
    onFailure: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale', color: 'danger' }
    ]
  },
  // Individual nodePools to scale
  // i3.xlarge nodes (to verify the boostrapping)
  nodes: [
    {
      nodePoolId: 'c-vsm2w:np-cgntb',
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-qsnss', //i3.xlarge
      minQuantity: 0,
      maxQuantity: 2,
      // Hooks to run before/after scale events for each node pool
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        // Example config for running a shell script on each of the nodes after startup
        // TODO: remove the token once we have made this repo public
        // We add the checksum for security... run `sha256sum ./config/_boostrap_nvme.sh` when you modify the file
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            script: `echo "Downloading and running bootstrap script";
                  wget -q https://github.com/mojaloop/rancher-scaler/raw/master/config/_install_cloudwatch.sh -O /tmp/_install_cloudwatch.sh;
                  wget -q https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/_boostrap_nvme.sh?token=AAM3EDGS6B6MENVUNSO23LS7BPEVM -O /tmp/_bootstrap_nvme.sh;
                  #TODO: reenable checksum
                  #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_install_cloudwatch.sh" | sha256sum --check;
                  #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
                  sudo sh /tmp/_install_cloudwatch.sh;
                  #this must be run last, as it does a reboot
                  sudo sh /tmp/_bootstrap_nvme.sh`
          },
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: '   Failed to scale `{{nodePoolId}}` "@Lewis Daly" !!!', color: 'danger' }
        ]
      }
    },
    {
      nodePoolId: 'c-vsm2w:np-brmwc',
      nodeTemplateId: 'cattle-global-nt:nt-v2mzg', // t3.small nodes (much cheaper)
      minQuantity: 0,
      maxQuantity: 2,
      // Hooks to run before/after scale events for each node pool
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: '   Failed to scale `{{nodePoolId}}` "@Lewis Daly" !!!', color: 'danger' }
        ]
      }
    }
  ]
}

module.exports = config
