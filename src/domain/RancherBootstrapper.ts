// TODO: remove these hard dependencies
import fs from 'fs'
import path from 'path'

import { RancherNode } from '../types/RancherRequestsTypes';
import { RancherRequests } from '../lib/RancherRequests';
import RancherScalerConfigType from '../types/RancherScalerConfigType';
import { Exec } from '../lib/Exec';
import { BootstrapHookType } from '../types/HookTypes';
import LoggerType from '../types/LoggerType';

/**
 * @class RancherBootstrapper
 * @description RancherBootstrapper runs commands on nodes after a scaling event has completed
 */
export class RancherBootstrapper {
  private rancherRequests: RancherRequests;
  private wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>
  private sleep: (timeMs: number) => Promise<void>
  private exec: Exec;
  private logger: LoggerType;

  constructor(
    rancherRequests: RancherRequests,
    config: RancherScalerConfigType,
    wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>,
    sleep: (timeMs: number) => Promise<void>,
    exec: Exec,
    logger: LoggerType
  ) {
    this.rancherRequests = rancherRequests
    this.wrapWithRetries = wrapWithRetries
    this.sleep = sleep
    this.exec = exec
    this.logger = logger
  }

  /**
   * @function runScriptForNodePool
   * @description Run the bootstrapper for a given node pool
   */
  public async runScriptForNodePool(nodePoolId: string, action: BootstrapHookType) {
    this.logger.debug(`RancherBootstrapper.runScriptForNodePool - running bootstrapper for node pool ${nodePoolId}, ${JSON.stringify(action)}`)

    // TODO: fix this hack - for some reason immediately after creating a new node, transitioning is false
    // a better option would be to pass in the expected node count, but that's also a pain
    // Wait for 25 seconds for node pool to at least show `transitioning`
    await this.sleep(1000 * 25)

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
    const nodeCount = result.data.length;

    // TODO: implement some expectedNodeCount...
    // if (nodeCount !== expectedNodeCount) {
    //   throw new Error(`Found ${nodeCount} nodes, expected ${expectedNodeCount}.`)
    // }

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
    const { data: nodes } = await this.rancherRequests.getNodesForNodePool(nodePoolId);

    const runnerErrors: any = []

    // For each node, run the bootstrap script
    // could be done in parallel, but that makes it harder to debug
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
    // TODO: refactor into Exec.makeTempDir
    const basePath = fs.mkdtempSync(path.join('/tmp/', 'rb-'))
    this.logger.debug(`RancherBootstrapper._runBootstrapForNode : ${basePath}`)

    try {
      // Download the keys
      const keyZipPath = `${basePath}/keys.zip`
      await this.rancherRequests.downloadConfigForNode(node.id, keyZipPath)

      // unzip the keys
      const keyDirPath = `${basePath}/keys`
      await this.exec.unzip(keyZipPath, keyDirPath)

      // Setup ssh session (chmod key file, add hostname to known_hosts)
      const keyPath = `${basePath}/keys/id_rsa`
      await this.exec.setupSsh(keyPath, node.sshUser, node.nodeName, action.script)

      // ssh into instance and run command
      const sshOutput = await this.exec.runInSsh(keyPath, node.sshUser, node.nodeName, action.script)
      this.logger.debug(`RancherBootstrapper._runBootstrapForNode, sshOutput: ${sshOutput}`)

      // Reboot the instance if we have configured it
      // This script fails by default, so we catch the error to fail silently
      if (action.rebootOnEnd) {
        await this.exec.runInSsh(keyPath, node.sshUser, node.nodeName, 'sudo shutdown -r now || true')
          .catch(_ => this.logger.debug('RancherBootstrapper._runBootstrapForNode failing silently for reboot'))
      }
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
  sleep: (timeMs: number) => Promise<void>,
  exec: Exec,
  logger: LoggerType,
): RancherBootstrapper => {
  const rancherBootstrapper = new RancherBootstrapper(rancherRequests, config, wrapWithRetries, sleep, exec, logger)

  return rancherBootstrapper;
}

export default makeRancherBootstrapper;

