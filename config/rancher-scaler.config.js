const config = {
  rancherBaseUrl: 'https://k8s-tanuki-rancher.mojaloop.live/v3',
  nodes: [
    {
      nodePoolId: 'c-vsm2w:np-mg5wr',
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      minQuantity: 0,
      maxQuantity: 2,
    }
  ]
}

module.exports = config