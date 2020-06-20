import LoggerType from '../types/LoggerType';
import { IncomingWebhook } from '@slack/webhook'


export abstract class Messager {
  public abstract async sendMessage(text: string): Promise<void>;
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
  public async sendMessage(text: string): Promise<void> {
    // TODO: format message
    const config = {
      text,
    }
    await this.incomingWebhookClient.send(config)
  }
}

/* DependencyInjection */
const makeSlack = (logger: LoggerType, incomingWebhookClient: IncomingWebhook): Slack => {
  const slack = new Slack(logger, incomingWebhookClient)

  return slack
}

export default makeSlack