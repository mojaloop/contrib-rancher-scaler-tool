import * as fs from 'fs'
import * as unzipper from 'unzipper'
import axios from 'axios'
import { execSync } from 'child_process'
const Logger = require('@mojaloop/central-services-logger')

import makeRancherScaler from './RancherScaler'
import makeRancherRequests from './RancherRequests'
import RancherScalerConfigType from './types/RancherScalerConfigType';
import getEnvConfig from './config';
import makeRancherBootstrapper from './RancherBootstrapper';
import wrapWithRetries from './lib/WrapWithRetries';
import makeExec from './Exec';

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
  Logger.info(`Running method: ${method}`)
  switch (method) {
    case 'VERIFY': {
      // Verify that the config works by calling `getNodePool`
      const result = await rancherRequests.getNodePool(config.nodes[0].nodePoolId)
      Logger.info('getNodePool reply', result)
      return;
    }
    // TODO: change to BOOTSTRAP
    case 'BOOTSTRAP': {
      //TODO: implement
      const exec = makeExec(fs, unzipper, execSync, Logger)
      const bootstrapper = makeRancherBootstrapper(rancherRequests, config, wrapWithRetries, exec, Logger);
      await bootstrapper.runBootstrapper()

      return;
    }
    case 'SCALE': {
      const scaler = makeRancherScaler(rancherRequests, Logger, config);

      //Scale up or down
      Logger.info(`    scale: ${scale}`)
      switch (scale) {
        case 'UP': return scaler.scaleUp()
        case 'DOWN': return scaler.scaleDown()
      }
    }
    default: {
      throw new Error(`Unhandled method: ${method}`);
    }
  }
}

main()