const config = {
  // Global hooks.
  // At least `global: {}` is required
  global: {
    preScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling up `2` node pools', color: 'warn' }
    ],
    postScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled up succesfully! 🎉🎉🎉', color: 'good' }
    ],
    preScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling down `2` node pool in `1 minute`\n\nRun:\n```kubectl patch cronjobs rancher-scaler-cron-down -p \'{ "spec": { "suspend": true } }\'```\n\n to stop this.', color: 'warn'},
      // Sleep to allow user intervention - Note: kubernetes will timeout the job after 10 minutes
      // { hookType: 'SLEEP', timeMs: 1000 * 60 * 1 }
    ],
    postScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled down `2` node pools! 🎉🎉🎉', color: 'good' }
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
      maxQuantity: 0,
      // Hooks to run before/after scale events for each node pool
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-cgntb` to `0` nodes' }
        ],
        // Example config for running a shell script on each of the nodes after startup
        // TODO: remove the token once we have made this repo public
        // We add the checksum for security... run `sha256sum ./config/_boostrap_nvme.sh` when you modify the file
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            script: `echo "Downloading and running bootstrap script"; 
                  wget https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/_boostrap_nvme.sh?token=AAM3EDHBMSVJADMWLCSXALS67KU4O -O /tmp/_bootstrap_nvme.sh; 
                  #TODO: reenable checksum
                  #echo "edeb16aaaab9261ba060144fb9c4c34925de6d4045c77b1fb9c5c631b753b9d0 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
                  sudo sh /tmp/_bootstrap_nvme.sh`
          },
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-cgntb` to `0` nodes' }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: '   Failed to scale `c-vsm2w:np-cgntb` "@Lewis Daly" !!!' }
        ]
      }
    },
    {
      nodePoolId: 'c-vsm2w:np-brmwc',
      nodeTemplateId: 'cattle-global-nt:nt-v2mzg', // t3.small nodes (much cheaper)
      minQuantity: 1,
      maxQuantity: 3,
      // Hooks to run before/after scale events for each node pool
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-brmwc` to `3` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-brmwc` to `1` node' }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: '   Failed to scale `c-vsm2w:np-brmwc` "@Lewis Daly" !!!', color: 'danger' }
        ]
      }
    }
  ]
}

module.exports = config