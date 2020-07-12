
// I'm just adding the typing for what we know we will need
export interface RancherNode {
  id: string;
  baseType: 'node';
  clusterId: string;
  created: string;
  nodeTemplateId: string;
  // 'active' | 'registering'
  state: string;
  transitioning: 'yes' | 'no';
  transitioningMessage: string;
  sshUser: string;
  externalIpAddress: string;
  hostname: string;
  nodeName: string;
  // EG: 'aws:///eu-west-2a/i-073df1ed66d910c2f'
  providerId: string;

}

export interface GetNodesForNodePoolResponse {
  data: RancherNode[];
}
