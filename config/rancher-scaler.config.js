const config = {
  // Global hooks.
  // At least `global: {}` is required
  global: {
    preScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Scaling up `1` node pools' }
    ],
    postScaleUp: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Scaled up succesfully!' }
    ],
    preScaleDown: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Scaling down `1` node pool in `3 minutes`' },
      { hookType: 'SLEEP', timeMs: 1000 * 60 * 3 }
    ],
    onFailure: [
      { hookType: 'SLACK_NOTIFICATION', contents: '[Rancher-Scaler] Failed to scale' }
    ]
  },
  nodes: [
    {
      nodePoolId: 'c-vsm2w:np-mg5wr',
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      minQuantity: 1,
      maxQuantity: 2,
      hooks: {
        preScaleUp: [
          { hookType: 'SLACK_NOTIFICATION', contents: '-   [Rancher-Scaler] Scaling `c-vsm2w:np-mg5wr` to `2` nodes' }
        ],
        preScaleDown: [
          { hookType: 'SLACK_NOTIFICATION', contents: '-   [Rancher-Scaler] Scaling `c-vsm2w:np-mg5wr` to `1` node' }
        ],

        // postScaleUp: [
        //   {
        //     // Only this action type is supported
        //     hookType: 'RUN_STARTUP_SCRIPT',
        //     // TODO: to run the script, this could be something like `curl url_of_file | sh`
        //     script: `echo "HELLO WORLD"; 
        //           wget https://google.com/ -O /tmp/hello; 
        //           cat /tmp/hello`
        //   },
        // ],
        onFailure: [
          { hookType: 'SLACK_NOTIFICATION', contents: '-    [Rancher-Scaler] Failed to scale `c-vsm2w:np-mg5wr`' }
        ]
      }
    }
  ]
}

module.exports = config