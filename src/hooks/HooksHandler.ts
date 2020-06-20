import AnyHookType from "types/HookTypes";
import LoggerType from 'types/LoggerType';
import { ActionEnum } from 'types/ActionEnum';
import { RancherBootstrapper } from 'RancherBootstrapper';


// For now, just support global hooks...
export class HooksHandler {
  logger: LoggerType;
  slackHandler: any;
  bootstrapper: RancherBootstrapper;

  constructor(logger: LoggerType, slackHandler: any, bootstrapper: RancherBootstrapper) {
    this.logger = logger;
    this.slackHandler = slackHandler;
    this.bootstrapper = bootstrapper;
  }



  /**
   * @function runHooks
   * @description Run the given hooks
   * @param hooks 
   */
  public async runHooks(hooks: Array<AnyHookType>): Promise<void> {
    this.logger.debug(`HooksHandler.runHooks - running ${hooks.length} hooks`);
  }

  public async _runHook(hook: AnyHookType, nodePoolId?: string): Promise<any> {
    switch (hook.hookType) {
      case ActionEnum.SLEEP: {
        return new Promise((resolve) => setTimeout(resolve, hook.timeMs))
      }
      case ActionEnum.SLACK_NOTIFICATION: {
        // todo: implement
        return this.slackHandler.sendMessage()
      }
      case ActionEnum.RUN_STARTUP_SCRIPT: {
        if (!nodePoolId) {
          throw new Error(`RUN_STARTUP_SCRIPT action cannot be global, requires a nodePoolId.`)
        }
        return this.bootstrapper._runBootstrapForNodePool(nodePoolId, hook)
      }
    }
  }

}

/* Dependency injection */
const makeHooksHandler = (logger: LoggerType, slackHandler: any, bootstrapper: RancherBootstrapper) => {
  const hooksHandler = new HooksHandler(logger, slackHandler, bootstrapper);

  return hooksHandler;
}

export default makeHooksHandler;