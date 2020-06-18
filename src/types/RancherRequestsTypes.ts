
// I'm just adding the typing for what we know we will need
export type RancherNode = {
  id: string;
  baseType: 'node';
  clusterId: string;
  created: string;
  nodeTemplateId: string;
  //'active' | 'registering'
  state: string;
  transitioning: 'yes' | 'no'
  transitioningMessage: string,
  sshUser: string, 
  externalIpAddress: string,
  hostname: string,
  nodeName: string,

}

export type GetNodesForNodePoolResponse = {
  data: Array<RancherNode>
}