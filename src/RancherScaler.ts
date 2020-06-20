import NodeType from './types/NodeType';
import RancherScalerConfigType from './types/RancherScalerConfigType';
import { RancherRequests } from './RancherRequests';

export class RancherScaler {
  rancherRequests: RancherRequests;
  logger: any;
  nodes: Array<NodeType>;

  constructor(rancherRequests: RancherRequests, logger: any, config: RancherScalerConfigType) {
    this.rancherRequests = rancherRequests;
    this.logger = logger;
    this.nodes = config.nodes
  }

  /**
   * @function scaleUp
   * @description Scale up the cluster by iterating through each of the nodes, 
  *   and applying the maxQuantity
   */
  public async scaleUp() {
    const errors: any = []

    await this.nodes.reduce(async (acc: Promise<void>, curr: NodeType) => {
      this.logger.info(`RancherScaler.scaleUp - Scaling node: ${curr.nodePoolId} to ${curr.maxQuantity}`)
      const config = { quantity: curr.maxQuantity, nodeTemplateId: curr.nodeTemplateId };
      return acc
        .then(() => this.rancherRequests.putNodePoolQuantity(curr.nodePoolId, config))
        .catch(err => {
          errors.push(err)
        })
    }, Promise.resolve())

    if (errors.length > 0) {
      this.logger.error(`RancherScaler.scaleUp - finished running with errors: \n${errors.map((e: any) => `${e}\n`)}`)
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

    await this.nodes.reduce(async (acc: Promise<void>, curr: NodeType) => {
      this.logger.info(`RancherScaler.scaleDown - Scaling node: ${curr.nodePoolId} to ${curr.minQuantity}`)
      const config = { quantity: curr.minQuantity, nodeTemplateId: curr.nodeTemplateId };
      return acc
        .then(() => this.rancherRequests.putNodePoolQuantity(curr.nodePoolId, config))
        .catch(err => {
          errors.push(err)
        })
    }, Promise.resolve())

    if (errors.length > 0) {
      this.logger.error(`RancherScaler.scaleDown - finished running with errors: \n${errors.map((e: any) => `${e}\n`)}`)
    }
  }
}


/* Dependency Injection */
const makeRancherScaler = (rancherRequests: RancherRequests, logger: any, config: RancherScalerConfigType): RancherScaler =>  {
  const rancherScaler = new RancherScaler(rancherRequests, logger, config)

  return rancherScaler;
}

export default makeRancherScaler