
import AWS from 'aws-sdk'
import LoggerType from 'types/LoggerType';


export abstract class AbstractCloudwatchClient {
  public abstract async getDashboard(name: string)
  public abstract async updateDashboard(name: string, content: any)
}

export class NoCloudwatchClient implements AbstractCloudwatchClient {
  private logger: LoggerType;

  constructor(logger: LoggerType) {
    this.logger = logger;
  }

  public async getDashboard(name: string) {
    this.logger.error(`CloudwatchClient.getDashboard called, but specifified NoCloudwatchClient. Doing nothing.`)
  }

  public async updateDashboard(name: string, content: any) {
    this.logger.error(`CloudwatchClient.updateDashboard called, but specifified NoCloudwatchClient. Doing nothing.`)
  }
}

/**
 * @class CloudwatchClient
 * @description A wrapper around the AWS Cloudwatch APIs we need
 */
export class CloudwatchClient implements AbstractCloudwatchClient{
  private logger: LoggerType
  private cloudwatchApi: AWS.CloudWatch

  constructor(logger: LoggerType, cloudwatchApi: AWS.CloudWatch) {
    this.logger = logger
    this.cloudwatchApi = cloudwatchApi
  }

  public async getDashboard(name: string) {
    this.logger.debug(`CloudwatchClient.getDashboard with name: ${name}`)

    const params = {
      DashboardName: name
    }

    return this.cloudwatchApi.getDashboard(params).promise()
  }

  public async updateDashboard(name: string, content: any) {
    this.logger.debug(`CloudwatchClient.updateDashboard with name: ${name}`)

    const params = {
      DashboardBody: JSON.stringify(content),
      DashboardName: name
    }
    return this.cloudwatchApi.putDashboard(params).promise()
  }

}

