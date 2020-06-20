const config = {
  // Global hooks.
  //At least `global: {}` is required
  global: {
    preScaleUp: [
      { actionType: 'SLACK_NOTIFICATION', contents: 'Scaling up' }
    ],
    postScaleUp: [
      { actionType: 'SLACK_NOTIFICATION', contents: 'Scaled up succesfully' }
    ],
    preScaleDown: [
      { actionType: 'SLACK_NOTIFICATION', contents: 'Scaling down 1 node pool in 2 minutes' },
      { actionType: 'SLEEP', timeMs: 1000 * 60 * 2 }
    ],
    onFailure: [
      { actionType: 'SLACK_NOTIFICATION', contents: 'Rancher-scaler failed to scale' }
    ]
  },
  nodes: [
    // {
    //   nodePoolId: 'c-vsm2w:np-mg5wr',
    //   nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
    //   minQuantity: 1,
    //   maxQuantity: 2,
    // },
    {
      nodePoolId: 'c-vsm2w:np-mg5wr',
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      minQuantity: 1,
      maxQuantity: 2,
      hooks: {
        postScaleUp: [
          {
            // Only this action type is supported
            actionType: 'RUN_STARTUP_SCRIPT',
            // TODO: to run the script, this could be something like `curl url_of_file | sh`
            script: `echo "HELLO WORLD"; 
                  wget https://google.com/ -O /tmp/hello; 
                  cat /tmp/hello`
          },
        ],
        onFailure: [
          { actionType: 'SLACK_NOTIFICATION', contents: 'Scaling NodePool Id: c-vsm2w:np-mg5wr failed' }
        ]
      }
      // bootstrapActions: [
      //   // note: only 1 action is currently supported
      //   { 
      //     // Only this action type is supported
      //     actionType: 'RUN_STARTUP_SCRIPT',
      //     // TODO: to run the script, this could be something like `curl url_of_file | sh`
      //     script: `echo "HELLO WORLD"; 
      //             wget https://google.com/ -O /tmp/hello; 
      //             cat /tmp/hello`
      //   }
      // ]
    }
  ]
}

module.exports = config