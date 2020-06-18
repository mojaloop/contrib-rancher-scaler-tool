import NodeType from './NodeType'

type RancherScalerConfigType = {
  // The baseUrl of the rancher cluster to talk to
  rancherBaseUrl: string,
  
  // The list of nodes that should be scaled
  nodes: Array<NodeType>
}

export default RancherScalerConfigType