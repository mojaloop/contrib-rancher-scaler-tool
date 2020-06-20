import * as fs from 'fs'
import * as unzipper from 'unzipper'
import axios from 'axios'
import { execSync } from 'child_process'

import Logger from '@mojaloop/central-services-logger'

import makeRancherScaler from './RancherScaler'
import makeRancherRequests from './RancherRequests'
import RancherScalerConfigType from './types/RancherScalerConfigType';
import getEnvConfig, { Method } from './config';
import makeRancherBootstrapper from './RancherBootstrapper';
import wrapWithRetries from './lib/WrapWithRetries';
import makeExec from './Exec';
import makeHooksHandler from 'hooks/HooksHandler'

async function main() {
  const {
    rancherBaseUrl,
    cattleAccessKey,
    cattleSecretKey,
    scale,
    method,
    pathToConfig,
  } = getEnvConfig()

  const config: RancherScalerConfigType = require(pathToConfig)

  if (!config) {
    throw new Error(`no config found at path: ${pathToConfig}`)
  }

  //TODO: validate the config
  const rancherRequests = makeRancherRequests(fs, axios, Logger, cattleAccessKey, cattleSecretKey, rancherBaseUrl);
  const exec = makeExec(fs, unzipper, execSync, Logger)
  const bootstrapper = makeRancherBootstrapper(rancherRequests, config, wrapWithRetries, exec, Logger);
  const hooksHandler = makeHooksHandler(Logger, {}, bootstrapper)

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
      // We pass in the hooksHandler to run the pre and post local hooks
      const scaler = makeRancherScaler(rancherRequests, Logger, hooksHandler, config);
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
        return;
      } catch (err) {
        hooksHandler.runHooks(config.global.onError)
      }
      break;
    }
    case Method.PRE_SCALE_GLOBAL: {
      return hooksHandler.runHooks(config.global.onError)
    }
    case Method.POST_SCALE_GLOBAL: {
      return hooksHandler.runHooks(config.global.onError)
    }
    default: {
      throw new Error(`Unhandled method: ${method}`);
    }
  }
}

main()