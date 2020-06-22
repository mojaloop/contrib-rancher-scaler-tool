const config = {
  // Global hooks.
  // At least `global: {}` is required
  global: {
    preScaleUp: [
      { hookType: 'SLACK_NsOTIFICATION', contents: '[Rancher-Scaler] Scaling up `1` node pools' }
    ],
    postScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Scaled up succesfully! 🎉🎉🎉' }
    ],
    preScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Scaling down `1` node pool in `1 minute`\nRun `kubectl patch cronjobs rancher-scaler-cron-down -p \'{ "spec": { "suspend": true } }\'` to stop this.' },
      // Sleep to allow user intervention - Note: kubernetes will timeout the job after 10 minutes
      // { hookType: 'SLEEP', timeMs: 1000 * 60 * 1 }
    ],
    postScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Scaled down succesfully! 🎉🎉🎉' }
    ],
    onFailure: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Failed to scale' }
    ]
  },
  // Individual nodePools to scale
  nodes: [
    // {
    //   nodePoolId: 'c-vsm2w:np-mg5wr',
    //   nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
    //   minQuantity: 1,
    //   maxQuantity: 2,
    //   // Hooks to run before/after scale events for each node pool
    //   hooks: {
    //     preScaleUp: [
    //       { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-mg5wr` to `2` nodes' }
    //     ],
    //     // Example config for running a shell script on each of the nodes after startup
    //     // TODO: remove the token once we have made this repo public
    //     postScaleUp: [
    //       {
    //         hookType: 'RUN_STARTUP_SCRIPT',
    //         script: `echo "Downloading and running bootstrap script"; 
    //               wget https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/_boostrap_nvme.sh?token=AAM3EDDHLDU5QIEMED6HYD2665NM4 -O /tmp/_bootstrap_nvme.sh; 
    //               echo "9ab2dac12a80da6f419cb6964f50b3cf6497a3d9f39e5f79044a45cf22ff7608 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
    //               #TODO: enable when we have fixed startup issues...
    //               #sudo sh /tmp/_bootstrap_nvme.sh`
    //       },
    //     ],
    //     preScaleDown: [
    //       { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-mg5wr` to `1` node' }
    //     ],
    //     onFailure: [
    //       { hookType: 'SLACK_NOTIFICATION', contents: '   Failed to scale `c-vsm2w:np-mg5wr` "@Lewis Daly" !!!' }
    //     ]
    //   }
    // },
    {
      // t3.small nodes (much cheaper)
      nodePoolId: 'c-vsm2w:np-brmwc',
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      minQuantity: 1,
      maxQuantity: 2,
      // Hooks to run before/after scale events for each node pool
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-brmwc` to `2` nodes' }
        ],
        // Example config for running a shell script on each of the nodes after startup
        // TODO: remove the token once we have made this repo public
        postScaleUp: [
          {
            hookType: 'RUN_STARTUP_SCRIPT',
            script: `echo "Downloading and running bootstrap script"; 
                  wget https://raw.githubusercontent.com/mojaloop/rancher-scaler/master/config/_boostrap_nvme.sh?token=AAM3EDDHLDU5QIEMED6HYD2665NM4 -O /tmp/_bootstrap_nvme.sh; 
                  echo "9ab2dac12a80da6f419cb6964f50b3cf6497a3d9f39e5f79044a45cf22ff7608 /tmp/_bootstrap_nvme.sh" | sha256sum --check;
                  #TODO: enable when we have fixed startup issues...
                  #sudo sh /tmp/_bootstrap_nvme.sh`
          },
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `c-vsm2w:np-brmwc` to `1` node' }
        ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: '   Failed to scale `c-vsm2w:np-brmwc` "@Lewis Daly" !!!' }
        ]
      }
    }
  ]
}

module.exports = config