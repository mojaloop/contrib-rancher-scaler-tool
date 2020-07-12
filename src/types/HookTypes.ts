import { ActionEnum } from './ActionEnum'

export type BootstrapHookType = {
  hookType: ActionEnum.RUN_STARTUP_SCRIPT,
  script: string,
  rebootOnEnd?: boolean,
}

export type CloudwatchAddNodesType = {
  hookType: ActionEnum.CLOUDWATCH_ADD_NODES,
  dashboardName: string,
  // TODO: anything else?
}

export type CloudwatchRemoveNodesType = {
  hookType: ActionEnum.CLOUDWATCH_REMOVE_NODES,
  dashboardName: string,
  // TODO: anything else?
}

export type SlackNotificationHookType = {
  hookType: ActionEnum.SLACK_NOTIFICATION,
  contents: string,
  color?: string
}

export type SleepHookType = {
  hookType: ActionEnum.SLEEP,
  timeMs: number,
}

type AnyHookType =
  BootstrapHookType |
  CloudwatchAddNodesType |
  CloudwatchRemoveNodesType |
  SlackNotificationHookType |
  SleepHookType

export default AnyHookType
