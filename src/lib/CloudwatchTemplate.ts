import LoggerType from 'types/LoggerType';


// export abstract class AbstractCloudwatchClient {
//   public abstract async getDashboard(name: string)
//   public abstract async updateDashboard(name: string, content: any)
// }

// export class NoCloudwatchClient implements AbstractCloudwatchClient {
//   private logger: LoggerType;

//   constructor(logger: LoggerType) {
//     this.logger = logger;
//   }

//   public async getDashboard(name: string) {
//     this.logger.error(`CloudwatchClient.getDashboard called, but specifified NoCloudwatchClient. Doing nothing.`)
//   }

//   public async updateDashboard(name: string, content: any) {
//     this.logger.error(`CloudwatchClient.updateDashboard called, but specifified NoCloudwatchClient. Doing nothing.`)
//   }
// }


export type CloudwatchTemplateConfigType = {
  //where the templates live
  pathToTemplateDir: string;
  // a template prefix string
  templatePrefix: string;
}
/**
 * @class CloudwatchTemplate
 * @description A utility to generate valid cloudwatch dashboards based on templates
 */
export class CloudwatchTemplate {
  private logger: LoggerType
  private config: CloudwatchTemplateConfigType

  constructor(logger: LoggerType, config: CloudwatchTemplateConfigType) {
    this.logger = logger
    this.config = config
  }

  /**
   * @function templateForNodes
   * @description Loads a template based on the dashboardName, and fills in the blanks
   *   based on the instanceIds provided
   * @param dashboardName - The name of the dashboard and template to look up
   * @param instanceIds - The instances to put into the dashboard
   */
  public async templateForNodes(dashboardName: string, instanceIds: Array<string>): Promise<any> {
    return {}
  }

  // public async getDashboard(name: string) {
  //   this.logger.debug(`CloudwatchClient.getDashboard with name: ${name}`)

  //   const params = {
  //     DashboardName: name
  //   }

  //   return this.cloudwatchApi.getDashboard(params).promise()
  // }

  // public async updateDashboard(name: string, content: any) {
  //   this.logger.debug(`CloudwatchClient.updateDashboard with name: ${name}`)

  //   const params = {
  //     DashboardBody: JSON.stringify(content),
  //     DashboardName: name
  //   }
  //   return this.cloudwatchApi.putDashboard(params).promise()
  // }
}

