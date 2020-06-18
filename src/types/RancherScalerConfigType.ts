import NodeType from './NodeType'

type RancherScalerConfigType = {
  // The baseUrl of the rancher cluster to talk to
  rancherBaseUrl: string,
  nodes: Array<NodeType>
}

export default RancherScalerConfigType