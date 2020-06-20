import * as fs from 'fs'
import * as unzipper from 'unzipper'
import axios from 'axios'
import { execSync } from 'child_process'
import { IncomingWebhook } from '@slack/webhook'

import Logger from '@mojaloop/central-services-logger'

import makeRancherScaler, { RancherScaler } from './RancherScaler'
import makeRancherRequests from './RancherRequests'
import RancherScalerConfigType from './types/RancherScalerConfigType';
import getEnvConfig, { Method } from './config';
import makeRancherBootstrapper from './RancherBootstrapper';
import wrapWithRetries from './lib/WrapWithRetries';
import makeExec from './Exec';
import makeHooksHandler, { HooksHandler } from './hooks/HooksHandler'
import AnyHookType from './types/HookTypes'
import makeSlack, { NoMessager, Messager } from './lib/Slack'

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
  //Scale up or down
  Logger.info(`    scale: ${scale}`)
  let scalerPromise;
  switch (scale) {
    case 'UP':
      scalerPromise = scaler.scaleUp();
      break;
    case 'DOWN':
      scalerPromise = scaler.scaleDown()
      break;
  }

  try {
    await scalerPromise
  } catch (err) {
    await hooksHandler.runHooks(config.global.onFailure || [])
  }

  return;
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

  const config: RancherScalerConfigType = require(pathToConfig)

  if (!config) {
    throw new Error(`no config found at path: ${pathToConfig}`)
  }

  //TODO: validate the config
  let slack: Messager = new NoMessager(Logger); //Default to NoMessager
  if (slackWebhookUrl) {
    const incomingWebhookClient = new IncomingWebhook(slackWebhookUrl);
    slack = makeSlack(Logger, incomingWebhookClient)
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
    // TODO: change to BOOTSTRAP
    case 'BOOTSTRAP': {
      throw new Error('no longer supported, use hooks instead...')
    }
    case Method.SCALE: {
      const scaler = makeRancherScaler(rancherRequests, Logger, hooksHandler, config);
      return runScale(scaler, hooksHandler, scale, config)
    }
    case Method.PRE_SCALE_UP_GLOBAL: return runGlobals(config.global.preScaleUp || [], hooksHandler, scale, config)
    case Method.POST_SCALE_UP_GLOBAL: return runGlobals(config.global.postScaleUp || [], hooksHandler, scale, config)
    case Method.PRE_SCALE_DOWN_GLOBAL: return runGlobals(config.global.preScaleDown || [], hooksHandler, scale, config)
    case Method.POST_SCALE_DOWN_GLOBAL: return runGlobals(config.global.postScaleDown || [], hooksHandler, scale, config)
    default: {
      throw new Error(`Unhandled method: ${method}`);
    }
  }
}

main()