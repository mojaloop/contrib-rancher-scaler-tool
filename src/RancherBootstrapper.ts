// TODO: remove these hard dependencies
import fs from 'fs'
import path from 'path'


import { RancherNode } from './types/RancherRequestsTypes';
import { RancherRequests } from './RancherRequests';
import RancherScalerConfigType from './types/RancherScalerConfigType';
import NodeType from './types/NodeType';
import { Exec } from 'Exec';
import { BootstrapHookType } from 'types/HookTypes';
import LoggerType from './types/LoggerType';


/**
 * @class RancherBootstrapper
 * @description RancherBootstrapper runs commands on nodes after a scaling event has completed
 */
export class RancherBootstrapper {
  rancherRequests: RancherRequests;
  nodes: Array<NodeType>;
  wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>
  exec: Exec;
  logger: LoggerType;

  constructor(
    rancherRequests: RancherRequests, 
    config: RancherScalerConfigType, 
    wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>,
    exec: Exec,
    logger: LoggerType
  ) {
    this.rancherRequests = rancherRequests;
    this.nodes = config.nodes
    this.wrapWithRetries = wrapWithRetries;
    this.exec = exec
    this.logger = logger
  }

  /**
   * @function runScriptForNodePool
   * @description Run the bootstrapper for a given node pool
   */
  public async runScriptForNodePool(nodePoolId: string, action: BootstrapHookType) {
    this.logger.debug(`RancherBootstrapper.runScriptForNodePool - running bootstrapper for node pool ${nodePoolId}, ${action}`)

    //wait for nodePoolId's nodes to be ready
    await this.wrapWithRetries(() => this._isNodePoolReady(nodePoolId), 15, 1000 * 30)

    await this._runBootstrapForNodePool(nodePoolId, action)
  }

  /**
   * @function _runBootstrapperForNodePool
   * @description Run the bootstrapper for a given node pool
   */
  public async _runBootstrapperForNodePool(nodePoolId: string, action: BootstrapHookType) {
    this.logger.debug(`RancherBootstrapper._runBootstrapperForNodePool - running bootstrapper for node pool ${nodePoolId}, ${action}`)

    //wait for nodePoolId's nodes to be ready
    await this.wrapWithRetries(() => this._isNodePoolReady(nodePoolId), 15, 1000 * 30)

    await this._runBootstrapForNodePool(nodePoolId, action)
  }

  /**
   * @function _isNodePoolReady
   * @description Get the status for the nodes in a nodepool to finish provisioning.
   *   resolves a promise when the nodes are all ready
   *   rejects a promise if they are not ready
   */
  public async _isNodePoolReady(nodePoolId: string): Promise<true> {
    this.logger.debug(`RancherBootstrapper._isNodePoolReady - ${nodePoolId}`)

    const result = await this.rancherRequests.getNodesForNodePool(nodePoolId);
    const nodeTransitioningCount = result.data.filter(node => node.transitioning === 'yes').length

    if (nodeTransitioningCount > 0) {
      throw new Error(`Found ${nodeTransitioningCount} nodes still transitioning.`)
    }

    return true;
  }

  /**
   * @function _runBootstrapForNodePool
   * @description For each node in the node pool, run the bootstrap command
   */
  public async _runBootstrapForNodePool(nodePoolId: string, action: BootstrapHookType) {
    this.logger.debug(`RancherBootstrapper._runBootstrapForNodePool - ${nodePoolId}`)
    //TODO: be able to configure this dynamically
    const { data: nodes } = await this.rancherRequests.getNodesForNodePool(nodePoolId);

    const runnerErrors: any = []

    await nodes.reduce(async (acc: Promise<void>, node: RancherNode) => {
      return acc
        .then(() => this._runBootstrapForNode(node, action))
        .catch(error => runnerErrors.push(error))
    }, Promise.resolve())
    
    if (runnerErrors.length > 0) {
      this.logger.error(`RancherBootstrapper._runBootstrapForNodePool, failed with ${runnerErrors.length} errors.`)
      throw new Error(`_runBootstrapForNodePool failed with errors: \n${runnerErrors.join('\n')}`)
    }
  }

  /**
   * @function _runBootstrapForNode
   * @description Run the bootstrap steps
   */
  public async _runBootstrapForNode(node: RancherNode, action: BootstrapHookType) {
    // TODO: make a tmp folder
    // TODO: refactor into Exec.makeTempDir
    // const basePath = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-'))
    const basePath = fs.mkdtempSync(path.join('/tmp/', 'rb-'))
    this.logger.debug(`RancherBootstrapper._runBootstrapForNode : ${basePath}`)

    try {
      //Download the keys
      const keyZipPath = `${basePath}/keys.zip`
      await this.rancherRequests.downloadConfigForNode(node.id, keyZipPath)
      
      // //unzip the keys
      const keyDirPath = `${basePath}/keys`
      await this.exec.unzip(keyZipPath, keyDirPath)
      
      // // //ssh into instance and run command
      const keyPath = `${basePath}/keys/id_rsa`
      // // For now this just takes the first thing in our actions
      await this.exec.runInSsh(keyPath, node.sshUser, node.nodeName, action.script)
    } catch (err) {
      this.logger.error(`RancherBootstrapper._runBootstrapForNode, ${node.id}, failed with error: ${err}`)
      throw err;
    }
  }
}

/* Dependency Injection */
const makeRancherBootstrapper = (
  rancherRequests: RancherRequests, 
  config: RancherScalerConfigType, 
  wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>,
  exec: Exec,
  logger: LoggerType,
): RancherBootstrapper => {
  const rancherBootstrapper = new RancherBootstrapper(rancherRequests, config, wrapWithRetries, exec, logger)

  return rancherBootstrapper;
}

export default makeRancherBootstrapper;

