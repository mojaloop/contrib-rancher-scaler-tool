const config = {
  // Global hooks.
  // At least `global: {}` is required
  global: {
    // preScaleUp: [
    //   { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling up `{{totalNodePools}}` node pools', color: 'warn' }
    // ],
    // postScaleUp: [
    //   { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled up succesfully! 🎉🎉🎉', color: 'good' }
    // ],
    // preScaleDown: [
    //   { hookType: 'SLACK_NOTIFICATION', contents: 'Scaling down `{{totalNodePools}}` node pool in `10 minutes`\n\nRun:\n```kubectl patch cronjobs rancher-scaler-cron-down -p \'{ "spec": { "suspend": true } }\'```\n\n to stop this.', color: 'warn'},
      // Sleep to allow user intervention - Note: kubernetes will timeout the job after 10 minutes
      // { hookType: 'SLEEP', timeMs: 1000 * 60 * 1 }
    // ],
    // postScaleDown: [
    //   { hookType: 'SLACK_NOTIFICATION', contents: 'Scaled down `{{totalNodePools}}` node pools! 🎉🎉🎉', color: 'good' }
    // ],
    // onFailure: [
    //   { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale', color: 'danger' }
    // ]
  },
  nodes: [
    {
      nodePoolId: 'c-kbc2d:np-g8g95', //k8s-tanuki-ubuntu-node-c5.2xlarge-perf
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-8tzlz', //c5.2xlarge
      minQuantity: 1,
      maxQuantity: 5,
      // hooks: {
        // preScaleUp: [
        //   { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{maxQuantity}}` nodes' }
        // ],
        // preScaleDown: [
        //   { hookType: 'SLACK_NOTIFICATION', contents: '  ↳ Scaling `{{nodePoolId}}` to `{{minQuantity}}` node' }
        // ],
        // onFailure: [
        //   { hookType: 'SLACK_NOTIFICATION', contents: 'Failed to scale `{{nodePoolId}}`' }
        // ]
      // }
    }
  ]
}

module.exports = config
