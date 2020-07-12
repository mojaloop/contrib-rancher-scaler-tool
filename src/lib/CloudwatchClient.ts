
import AWS from 'aws-sdk'
import LoggerType from 'types/LoggerType';

/**
 * @class CloudwatchClient
 * @description A wrapper around the AWS Cloudwatch APIs we need
 */
export class CloudwatchClient {
  private logger: LoggerType
  private cloudwatchApi: AWS.CloudWatch

  constructor(logger: LoggerType, cloudwatchApi: AWS.CloudWatch) {
    this.logger = logger
    this.cloudwatchApi = cloudwatchApi
  }

  public async updateDashboard(name: string, content: string) {
    this.logger.debug(`CloudwatchClient.updateDashboard with name: ${name}`)

    const params = {
      DashboardBody: content,
      DashboardName: name
    }
    await this.cloudwatchApi.putDashboard(params).promise()
  }

}

