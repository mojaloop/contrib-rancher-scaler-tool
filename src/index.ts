import * as fs from 'fs'
import * as unzipper from 'unzipper'
import axios from 'axios'
import { execSync } from 'child_process'
import { IncomingWebhook } from '@slack/webhook'
import Logger from '@mojaloop/central-services-logger'

import makeRancherScaler, { RancherScaler } from './domain/RancherScaler'
import makeRancherRequests from './lib/RancherRequests'
import RancherScalerConfigType from './types/RancherScalerConfigType';
import getEnvConfig, { Method } from './lib/EnvConfig';
import makeRancherBootstrapper from './domain/RancherBootstrapper';
import wrapWithRetries from './lib/WrapWithRetries';
import makeExec from './lib/Exec';
import makeHooksHandler, { HooksHandler } from './domain/HooksHandler'
import AnyHookType from './types/HookTypes'
import makeSlack, { NoMessager, Messager } from './lib/Slack'
import makeScalerConfig from './lib/ScalerConfig'
import configValidator from './lib/ConfigValidator'
import makeTemplater, { Templater } from './lib/Templater'

async function runGlobals(hooks: Array<AnyHookType>, hooksHandler: HooksHandler, scale: 'UP' | 'DOWN', config: RancherScalerConfigType) {
  try {
    await hooksHandler.runHooks(hooks)
  } catch (err) {
    Logger.error(`error running globals: ${err}`)
    await hooksHandler.runHooks(config.global.onFailure || [])
  }
}

async function runScale(scaler: RancherScaler, hooksHandler: HooksHandler, scale: 'UP' | 'DOWN', config: RancherScalerConfigType) {
  // We pass in the hooksHandler to run the pre and post local hooks
  // Scale up or down
  Logger.info(`    scale: ${scale}`)
  let scalerPromise = Promise.resolve(true)
  switch (scale) {
    case 'UP':
      return scalerPromise
      .then(() => hooksHandler.runHooks(config.global.preScaleUp || []))
      .then(() => scaler.scaleUp())
      .then(() => hooksHandler.runHooks(config.global.postScaleUp || []))
      .catch(() => hooksHandler.runHooks(config.global.onFailure || []))
    case 'DOWN':
      return scalerPromise
      .then(() => hooksHandler.runHooks(config.global.preScaleDown || []))
      .then(() => scaler.scaleDown())
      .then(() => hooksHandler.runHooks(config.global.postScaleDown || []))
      .catch(() => hooksHandler.runHooks(config.global.onFailure || []))
  }
}

async function main() {
  const {
    rancherBaseUrl,
    cattleAccessKey,
    cattleSecretKey,
    scale,
    method,
    pathToConfig,
    slackWebhookUrl,
  } = getEnvConfig()

  /* Init all dependencies */
  const scalerConfig = makeScalerConfig(configValidator);
  const config = scalerConfig.getConfig(pathToConfig)


  let slack: Messager = new NoMessager(Logger); //Default to NoMessager
  if (slackWebhookUrl) {
    Logger.debug(`index.ts - setting up slack with SLACK_WEBHOOK_URL:${slackWebhookUrl}`)
    const incomingWebhookClient = new IncomingWebhook(slackWebhookUrl);
    const templaterConfig = Templater.transformConfigToTemplateConfig(config)
    const templater = makeTemplater(Logger, templaterConfig)
    slack = makeSlack(Logger, incomingWebhookClient, templater)
  }

  const rancherRequests = makeRancherRequests(fs, axios, Logger, cattleAccessKey, cattleSecretKey, rancherBaseUrl);
  const exec = makeExec(fs, unzipper, execSync, Logger)
  const bootstrapper = makeRancherBootstrapper(rancherRequests, config, wrapWithRetries, exec, Logger);
  const hooksHandler = makeHooksHandler(Logger, slack, bootstrapper)

  Logger.info(`Running method: ${method}`)
  switch (method) {
    case 'VERIFY': {
      // Verify that the config works by calling `getNodePool`
      const result = await rancherRequests.getNodePool(config.nodes[0].nodePoolId)
      Logger.info(`VERIFY: getNodePool reply: ${JSON.stringify(result)}`)
      return;
    }
    case 'BOOTSTRAP': {
      throw new Error('no longer supported, use hooks instead...')
    }
    case Method.SCALE: {
      const scaler = makeRancherScaler(rancherRequests, Logger, hooksHandler, config);
      return runScale(scaler, hooksHandler, scale, config)
    }
    // Manually run the hooks
    case Method.PRE_SCALE_UP_GLOBAL: return runGlobals(config.global.preScaleUp || [], hooksHandler, scale, config)
    case Method.POST_SCALE_UP_GLOBAL: return runGlobals(config.global.postScaleUp || [], hooksHandler, scale, config)
    case Method.PRE_SCALE_DOWN_GLOBAL: return runGlobals(config.global.preScaleDown || [], hooksHandler, scale, config)
    case Method.POST_SCALE_DOWN_GLOBAL: return runGlobals(config.global.postScaleDown || [], hooksHandler, scale, config)
    default: {
      throw new Error(`Unhandled method: ${method}`);
    }
  }
}

(async () => {
  try {
    await main()
    process.exit(0)
  } catch (err) {
    Logger.error(`rancher-scaler failed with error: ${err}`)
    console.error(err)
    process.exit(1)
  }
})();
