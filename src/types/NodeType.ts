type NodeType = {
  // The nodePoolId that should be scaled
  nodePoolId: string;

  // The template to use when scaling
  nodeTemplateId: string;

  // The number of nodes to scale DOWN to
  minQuantity: number;

  // The number of nodes to scale UP to
  maxQuantity: number
}

export default NodeType