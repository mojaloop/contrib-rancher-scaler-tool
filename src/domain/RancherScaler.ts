import NodeType from '../types/NodeType';
import RancherScalerConfigType from '../types/RancherScalerConfigType';
import { RancherRequests } from '../lib/RancherRequests';
import { HooksHandler } from './HooksHandler'

export class RancherScaler {
  rancherRequests: RancherRequests;
  logger: any;
  hooksHandler: HooksHandler;
  nodes: Array<NodeType>;

  constructor(rancherRequests: RancherRequests, logger: any, hooksHandler: HooksHandler, config: RancherScalerConfigType) {
    this.rancherRequests = rancherRequests;
    this.logger = logger;
    this.hooksHandler = hooksHandler;
    this.nodes = config.nodes
  }

  /**
   * @function scaleUp
   * @description Scale up the cluster by iterating through each of the nodes,
  *   and applying the maxQuantity
   */
  public async scaleUp() {
    const errors: any = []

    // Note: this serializes scaling for easy debugging, but we may want to run in paralell in the future
    await this.nodes.reduce(async (acc: Promise<void>, node: NodeType) => {
      return acc
        .then(() => this._scaleNodePoolUp(node))
        .catch(err => {
          errors.push(err)

          return this.hooksHandler.runHooks(node.hooks && node.hooks.onFailure || [])
        })
        // handle an error hook failure
        .catch(err => {
          errors.push(err)
        })
    }, Promise.resolve())

    if (errors.length > 0) {
      const message = `RancherScaler.scaleUp - finished running with errors: \n${errors.map((e: any) => `${e}\n`)}`
      this.logger.error(message)
      throw new Error(message)
    }
  }

  /**
  * @function scaleDown
  * @description Scale down the cluster by iterating through each of the nodes,
  *   and applying the minQuantity
  *
  */
  public async scaleDown() {
    const errors: any = []

    // Note: this serializes scaling for easy debugging, but we may want to run in parallel in the future
    await this.nodes.reduce(async (acc: Promise<void>, node: NodeType) => {
      return acc
        .then(() => this._scaleNodePoolDown(node))
        .catch(err => {
          errors.push(err)
          // Run the individual failure hooks
          return this.hooksHandler.runHooks(node.hooks && node.hooks.onFailure || [])
        })
        // handle an error hook failure
        .catch(err => {
          errors.push(err)
        })
    }, Promise.resolve())

    if (errors.length > 0) {
      const message = `RancherScaler.scaleDown - finished running with errors: \n${errors.map((e: any) => `${e}\n`)}`
      this.logger.error(message)
      throw new Error(message)
    }
  }

  /**
   * @function verifyNodePoolsAndTemplates
   * @description Go through all of the node pools and templates in the config, and make sure they are valid
   */
  public async verifyNodePoolsAndTemplates() {
    const errors: any = []

    // Note: this serializes scaling for easy debugging, but we may want to run in parallel in the future
    await this.nodes.reduce(async (acc: Promise<void>, node: NodeType) => {
      return acc
        .then(() => this.rancherRequests.getNodePool(node.nodePoolId))
        .then(() => this.rancherRequests.getNodeTemplate(node.nodeTemplateId))
        .catch(err => {
          errors.push(err)
        })
    }, Promise.resolve())

    if (errors.length > 0) {
      const message = `RancherScaler.verifyNodePoolsAndTemplates - Failed with errors: \n${errors.map((e: any) => `${e}\n`)}`
      this.logger.error(message)
      throw new Error(message)
    }

  }

  public async _scaleNodePoolUp(node: NodeType): Promise<void> {
    this.logger.info(`RancherScaler.scaleUp - preScaleUp`)
    await this.hooksHandler.runHooks(node.hooks && node.hooks.preScaleUp || [], node.nodePoolId)

    this.logger.info(`RancherScaler.scaleUp - Scaling node: ${node.nodePoolId} to ${node.maxQuantity}`)
    const config = { quantity: node.maxQuantity, nodeTemplateId: node.nodeTemplateId };
    await this.rancherRequests.putNodePoolQuantity(node.nodePoolId, config)

    this.logger.info(`RancherScaler.scaleUp - postScaleUp`)
    await this.hooksHandler.runHooks(node.hooks && node.hooks.postScaleUp || [], node.nodePoolId)
  }

  public async _scaleNodePoolDown(node: NodeType): Promise<void> {
    this.logger.info(`RancherScaler.scaleDown - preScaleDown`)
    await this.hooksHandler.runHooks(node.hooks && node.hooks.preScaleDown || [], node.nodePoolId)

    this.logger.info(`RancherScaler.scaleDown - Scaling node: ${node.nodePoolId} to ${node.minQuantity}`)
    const config = { quantity: node.minQuantity, nodeTemplateId: node.nodeTemplateId };
    await this.rancherRequests.putNodePoolQuantity(node.nodePoolId, config)

    this.logger.info(`RancherScaler.scaleDown - postScaleDown`)
    await this.hooksHandler.runHooks(node.hooks && node.hooks.postScaleDown || [], node.nodePoolId)
  }
}

/* Dependency Injection */
const makeRancherScaler = (rancherRequests: RancherRequests, logger: any, hooksHandler: HooksHandler, config: RancherScalerConfigType): RancherScaler =>  {
  const rancherScaler = new RancherScaler(rancherRequests, logger, hooksHandler, config)

  return rancherScaler;
}

export default makeRancherScaler
