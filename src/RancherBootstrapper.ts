import { RancherRequests } from './RancherRequests';
import RancherScalerConfigType from './types/RancherScalerConfigType';
import NodeType from './types/NodeType';

/**
 * @class RancherBootstrapper
 * @description RancherBootstrapper runs commands on nodes after a scaling event has completed
 */
export class RancherBootstrapper {
  rancherRequests: RancherRequests;
  nodes: Array<NodeType>;
  wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>

  constructor(rancherRequests: RancherRequests, config: RancherScalerConfigType, wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>) {
    this.rancherRequests = rancherRequests;
    this.nodes = config.nodes
    this.wrapWithRetries = wrapWithRetries;
  }

  /**
   * @function runBootsrapper
   * @description Run the bootstrapper across all node configs
   */
  public async runBootstrapper() {
    //Filter through the config until we have just all configs with boostrap commands
    const bootstrapNodes = this.nodes.filter(n => n.bootstrapActions)
    const bootstrapperErrors: any = []

    Promise.all(
      bootstrapNodes
        .map(async n => this._runBootstrapperForNodePool(n.nodePoolId, n.bootstrapActions)
        .catch(error => bootstrapperErrors.push(error))
      )
    )

    if (bootstrapperErrors.length > 0) {
      throw new Error(`Bootstrapper failed with errors: \n${bootstrapperErrors.join('\n')}`)
    }
  }

  /**
   * @function _runBootstrapperForNodePool
   * @description Run the bootstrapper for a given node pool
   */
  public async _runBootstrapperForNodePool(nodePoolId: string, bootstrapActions: any) {
    console.log("running bootstrapper for node pool", nodePoolId, bootstrapActions)

    //TODO: wait for nodePoolId
    await this.wrapWithRetries(() => this._isNodePoolReady(nodePoolId), 10, 1000 * 20)

  }

  /**
   * @function _isNodePoolReady
   * @description Get the status for the nodes in a nodepool to finish provisioning.
   *   resolves a promise when the nodes are all ready
   *   rejects a promise if they are not ready
   */
  public async _isNodePoolReady(nodePoolId: string): Promise<true> {
    console.log("RancherBootstrapper._isNodePoolReady", nodePoolId)

    const result = await this.rancherRequests.getNodesForNodePool(nodePoolId);
    const nodeTransitioningCount = result.data.map(node => node.transitioning === 'yes').length

    if (nodeTransitioningCount > 0) {
      throw new Error(`Found ${nodeTransitioningCount} nodes still transitioning.`)
    }

    return true;
  }

  /**
   * @function _runBootstrapForNodePool
   * @description For each node in the node pool, run the bootstrap command
   */
  public async _runBootstrapForNodePool(nodePoolId: string) {
    console.log("RancherBootstrapper._runBootstrapForNodePool", nodePoolId)
  }
}

/* Dependency Injection */
const makeRancherBootstrapper = (
  rancherRequests: RancherRequests, 
  config: RancherScalerConfigType, 
  wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>
): RancherBootstrapper => {
  const rancherBootstrapper = new RancherBootstrapper(rancherRequests, config, wrapWithRetries)

  return rancherBootstrapper;
}

export default makeRancherBootstrapper;

