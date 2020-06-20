import { ActionEnum } from './ActionEnum'

export type BootstrapHookType = {
  hookType: ActionEnum.RUN_STARTUP_SCRIPT,
  script: string
}

export type SlackNotificationHookType = {
  hookType: ActionEnum.SLACK_NOTIFICATION,
  conents: string,
}

export type SleepHookType = {
  hookType: ActionEnum.SLEEP,
  timeMs: number,
}


type AnyHookType = BootstrapHookType | SlackNotificationHookType | SleepHookType


export default AnyHookType
