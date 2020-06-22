import LoggerType from '../types/LoggerType';
import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook'


export abstract class Messager {
  public abstract async sendMessage(text: string): Promise<void>;
  public abstract async sendMessage(text: string, color?: string): Promise<void>;
  public abstract async sendMessage(complexMessage: any): Promise<void>;
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

  constructor(logger: LoggerType, incomingWebhookClient: IncomingWebhook) {
    this.logger = logger;
    this.incomingWebhookClient = incomingWebhookClient
  }

  /**
   * @function sendMessage
   * @description Send a slack message
   * @param text 
   */
  public async sendMessage(text: string): Promise<void>
  public async sendMessage(text: string, color?: string): Promise<void>
  public async sendMessage(text: any, color?: string): Promise<void> {
    let config: IncomingWebhookSendArguments = {};
    if (typeof text === 'string') {
      config = {
        text,
      }
    }

    if (color) {
      config = {
        attachments: [
          {
            color,
            title: 'Rancher-Scaler',
            text,
          }
        ]
      }
    }

    this.logger.debug(`Slack.sendMessage with config: ${JSON.stringify(config)}`)

    await this.incomingWebhookClient.send(config)
  }
}

/* DependencyInjection */
const makeSlack = (logger: LoggerType, incomingWebhookClient: IncomingWebhook): Slack => {
  const slack = new Slack(logger, incomingWebhookClient)

  return slack
}

export default makeSlack