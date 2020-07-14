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
        // TODO: how do we remove nodes that no longer exist?
        // I guess this should be a pre-scale event
        return;
    }
  }

  /**
   * @function _addNodesToDash
   * @description Add the nodes in a nodepool to the dashboard
   */
  public async _addNodesToDash(nodePoolId: string, dashboard: string) {

    //TODO: make RancherBootstrapper's wait for nodes to be ready generic and call here...

    // Get the names of the nodes
    const nodes = await this.rancherRequests.getNodesForNodePool(nodePoolId)
    const awsInstanceIds = nodes.data.map(n => n.providerId.split('/').pop())

    // TODO: get more instance details using `ec2.describeInstances()`?
    // Or can we call some cloudwatch functions to get the available metrics?
    // And then filter the metrics based on the instanceIds?
    console.log("awsInstanceIds are", awsInstanceIds)
    // TODO: look up the template for the dashboard and parse into a dashboard
    // Call the cloudwatch api
    const dashboardJson = require(`../../config/cloudwatch/template-${dashboard}.js`)


    /*
      [ "CWAgent", "cpu_usage_idle", "InstanceId", "i-0e11b2188d6e5dd4f", "ImageId", "ami-ff46a298", "cpu", "cpu3", "InstanceType", "i3.xlarge", { "visible": false } ],
      [ ".", "cpu_usage_user", ".", "i-0e11b2188d6e5dd4f", ".", ".", ".", "cpu3", ".", "." ],
      [ "...", "cpu2", ".", "." ],
      [ "...", "cpu1", ".", "." ],
      [ "...",  "cpu0",  ".",  "." ],
      [".", "cpu_usage_system", ".", "i-0e11b2188d6e5dd4f", ".", ".", ".", ".", ".", "."],
    */
    // const cpuUsagePartial =

    const result = await this.cloudwatchClient.updateDashboard(dashboard, dashboardJson)
    // const result = await this.cloudwatchClient.getDashboard(dashboard)
    console.log('result is', result)
    // console.log(JSON.stringify(JSON.parse(result.DashboardBody), null, 2))
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
