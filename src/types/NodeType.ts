import BootstrapHookType from './HookTypes'
import AnyHookType from './HookTypes'

interface NodeType {
  // The nodePoolId that should be scaled
  nodePoolId: string;

  // The template to use when scaling
  nodeTemplateId: string;

  // The number of nodes to scale DOWN to
  minQuantity: number;

  // The number of nodes to scale UP to
  maxQuantity: number;

  // Hooks to run before/after scaling
  hooks?: {
    preScaleUp?: Array<AnyHookType>,
    postScaleUp?: Array<AnyHookType>,
    preScaleDown?: Array<AnyHookType>,
    postScaleDown?: Array<AnyHookType>,
    onFailure?: Array<AnyHookType>,
  }
}

export default NodeType
