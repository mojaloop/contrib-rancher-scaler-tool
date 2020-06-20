import NodeType from './NodeType'
import AnyHookType from './HookTypes'

interface RancherScalerConfigType {
  // Global hooks before the entire cron runs
  global: {
    preScaleUp?: Array<AnyHookType>,
    postScaleUp?: Array<AnyHookType>,
    preScaleDown?: Array<AnyHookType>,
    postScaleDown?: Array<AnyHookType>,
    onFailure?: Array<AnyHookType>,
  }

  // The list of nodes that should be scaled
  nodes: NodeType[];
}

export default RancherScalerConfigType
