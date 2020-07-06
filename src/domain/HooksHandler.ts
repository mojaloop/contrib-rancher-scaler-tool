import AnyHookType from "../types/HookTypes";
import LoggerType from '../types/LoggerType';
import { ActionEnum } from '../types/ActionEnum';
import { RancherBootstrapper } from './RancherBootstrapper';
import { Messager } from '../lib/Slack';


// For now, just support global hooks...
export class HooksHandler {
  logger: LoggerType;
  slackHandler: Messager;
  bootstrapper: RancherBootstrapper;

  constructor(logger: LoggerType, slackHandler: Messager, bootstrapper: RancherBootstrapper) {
    this.logger = logger;
    this.slackHandler = slackHandler;
    this.bootstrapper = bootstrapper;
  }

  // TODO: separate between global and local hooks?

  /**
   * @function runHooks
   * @description Run the given hooks
   * @param hooks
   */
  public async runHooks(hooks: Array<AnyHookType>, nodePoolId?: string): Promise<void> {
    this.logger.debug(`HooksHandler.runHooks - running ${hooks.length} hooks`);

    const errors: any = [];
    await hooks.reduce(async (acc: Promise<void>, hook: AnyHookType) => {
      return acc
        .then(() => this._runHook(hook, nodePoolId))
        .catch(err => {
          errors.push(err)
        })
    }, Promise.resolve())

    if (errors.length > 0) {
      const message = `HooksHandler.runHooks - finished running with errors: \n${errors.map((e: any) => `${e}\n`)}`
      this.logger.error(message)
      throw new Error(message)
    }
  }

  public async _runHook(hook: AnyHookType, nodePoolId?: string): Promise<any> {
    this.logger.debug(`HooksHandler._runHook - ${hook.hookType}`);

    switch (hook.hookType) {
      case ActionEnum.SLEEP: {
        return new Promise((resolve) => setTimeout(resolve, hook.timeMs))
      }
      case ActionEnum.SLACK_NOTIFICATION: {
        // todo: implement
        return this.slackHandler.sendMessage(hook.contents, hook.color, nodePoolId)
      }
      case ActionEnum.RUN_STARTUP_SCRIPT: {
        if (!nodePoolId) {
          throw new Error(`RUN_STARTUP_SCRIPT action cannot be global, requires a nodePoolId.`)
        }
        return this.bootstrapper.runScriptForNodePool(nodePoolId, hook)
      }
    }
  }
}

/* Dependency injection */
const makeHooksHandler = (logger: LoggerType, slackHandler: Messager, bootstrapper: RancherBootstrapper) => {
  const hooksHandler = new HooksHandler(logger, slackHandler, bootstrapper);

  return hooksHandler;
}

export default makeHooksHandler;
