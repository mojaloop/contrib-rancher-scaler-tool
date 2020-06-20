import NodeType from './NodeType'

interface RancherScalerConfigType {
  // The list of nodes that should be scaled
  nodes: NodeType[];
}

export default RancherScalerConfigType
