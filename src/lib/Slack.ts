import LoggerType from '../types/LoggerType';
import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook'
import { Templater } from './Templater';


export abstract class Messager {
  public abstract async sendMessage(text: string, nodePoolId?: string): Promise<void>;
  public abstract async sendMessage(text: string, color?: string, nodePoolId?: string): Promise<void>;
  public abstract async sendMessage(complexMessage: any, nodePoolId?: string): Promise<void>;
}

export class NoMessager implements Messager {
  private logger: LoggerType;

  constructor(logger: LoggerType) {
    this.logger = logger;
  }

  public async sendMessage(text: string): Promise<void> {
    this.logger.error('Tried to send message, but message config not configured')
  }
}

export class Slack implements Messager {
  private logger: LoggerType;
  private incomingWebhookClient: IncomingWebhook;
  private templater: Templater

  constructor(logger: LoggerType, incomingWebhookClient: IncomingWebhook, templater: Templater) {
    this.logger = logger;
    this.incomingWebhookClient = incomingWebhookClient
    this.templater = templater;
  }

  /**
   * @function sendMessage
   * @description Send a slack message
   * @param text
   */
  public async sendMessage(text: string, nodePoolId?: string): Promise<void>
  public async sendMessage(text: string, color?: string, nodePoolId?: string): Promise<void>
  public async sendMessage(text: any, color?: string, nodePoolId?: string): Promise<void> {
    let config: IncomingWebhookSendArguments = {};
    if (typeof text === 'string') {
      config = {
        text: this.templater.replace(text, nodePoolId),
      }
    }

    if (color) {
      config = {
        attachments: [
          {
            color,
            title: 'Rancher-Scaler',
            text: this.templater.replace(text, nodePoolId),
          }
        ]
      }
    }

    this.logger.debug(`Slack.sendMessage with config: ${JSON.stringify(config)}`)

    await this.incomingWebhookClient.send(config)
  }
}

/* DependencyInjection */
const makeSlack = (logger: LoggerType, incomingWebhookClient: IncomingWebhook, templater: Templater): Slack => {
  const slack = new Slack(logger, incomingWebhookClient, templater)

  return slack
}

export default makeSlack
