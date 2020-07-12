import { RancherNode } from '../types/RancherRequestsTypes';
import { RancherRequests } from '../lib/RancherRequests';
import RancherScalerConfigType from '../types/RancherScalerConfigType';
import NodeType from '../types/NodeType';
import { Exec } from 'lib/Exec';
import { CloudwatchAddNodesType, CloudwatchRemoveNodesType } from '../types/HookTypes';
import LoggerType from '../types/LoggerType';
import { ActionEnum } from '../types/ActionEnum';
import { CloudwatchClient, AbstractCloudwatchClient } from '../lib/CloudwatchClient';

/**
 * @class CloudwatchUpdater
 * @description CloudwatchUpdater updates cloudwatch dashboards after a scaling event
 */
export class CloudwatchUpdater {
  private rancherRequests: RancherRequests;
  private cloudwatchClient: AbstractCloudwatchClient;
  private nodes: Array<NodeType>;
  // private wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>
  private logger: LoggerType;

  constructor(
    rancherRequests: RancherRequests,
    cloudwatchClient: AbstractCloudwatchClient,
    config: RancherScalerConfigType,
    // wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>,
    logger: LoggerType
  ) {
    this.rancherRequests = rancherRequests;
    this.cloudwatchClient = cloudwatchClient;
    this.nodes = config.nodes
    // this.wrapWithRetries = wrapWithRetries;
    this.logger = logger
  }

  /**
   * @function updateCloudwatchDashboard
   * @description Common entrypoint for Cloudwatch related actions
   */
  public async updateCloudwatchDashboard(nodePoolId: string, action: CloudwatchAddNodesType | CloudwatchRemoveNodesType) {
    this.logger.debug(`CloudwatchUpdater.updateCloudwatchDashboard - running for node pool ${nodePoolId}, ${JSON.stringify(action)}`)

    //TODO: depending on the event, add or remove nodes from the dashboard?
    //TODO: how will we remove them?
    switch (action.hookType) {
      case ActionEnum.CLOUDWATCH_ADD_NODES: return this._addNodesToDash(nodePoolId, action.dashboardName)
      case ActionEnum.CLOUDWATCH_REMOVE_NODES:
        this.logger.debug('doing stuff with nodes now!')
        return;
    }
  }

  /**
   * @function _addNodesToDash
   * @description Add the nodes in a nodepool to the dashboard
   */
  public async _addNodesToDash(nodePoolId: string, dashboard: string) {
    // Get the names of the nodes
    const nodes = await this.rancherRequests.getNodesForNodePool(nodePoolId)
    // const instanceIds = nodes.data.map(n => n.)
    const instanceIds = []
    // look up the template for the dashboard and parse into a dashboard
    // Call the cloudwatch api
    const dashboardJson = ""

    // await this.cloudwatchClient.updateDashboard(dashboard, dashboardJson)
    const result = await this.cloudwatchClient.getDashboard(dashboard)
    console.log('result is', result)
  }
}

const makeCloudwatchUpdater = (
  rancherRequests: RancherRequests,
  cloudwatchClient: AbstractCloudwatchClient,
  config: RancherScalerConfigType,
  // wrapWithRetries: (func: any, retries: number, waitTimeMs: number) => Promise<any>,
  logger: LoggerType
): CloudwatchUpdater => {
  const cloudwatchUpdater = new CloudwatchUpdater(rancherRequests, cloudwatchClient, config, logger);
  return cloudwatchUpdater;
}

export default makeCloudwatchUpdater;
