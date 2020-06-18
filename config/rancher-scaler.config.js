const config = {
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
      bootstrapActions: [
        { actionId: 'SCP_COOL_SCRIPT' }
      ]
    }
  ]
}

module.exports = config