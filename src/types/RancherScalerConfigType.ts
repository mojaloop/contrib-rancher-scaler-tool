import NodeType from './NodeType'

type RancherScalerConfigType = {
  // The list of nodes that should be scaled
  nodes: Array<NodeType>
}

export default RancherScalerConfigType