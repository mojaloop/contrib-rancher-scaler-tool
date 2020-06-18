import fs from 'fs'
import unzipper from 'unzipper'
import axios from 'axios'
import { execSync } from 'child_process'

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
  const rancherRequests = makeRancherRequests(fs, axios, cattleAccessKey, cattleSecretKey, rancherBaseUrl);
  console.log(`Running method: ${method}`)
  switch (method) {
    case 'VERIFY': {
      // Verify that the config works by calling `getNodePool`
      const result = await rancherRequests.getNodePool(config.nodes[0].nodePoolId)
      console.log('getNodePool reply', result)
      return;
    }
    // TODO: change to BOOTSTRAP
    case 'BOOTSTRAP': {
      //TODO: implement
      const exec = makeExec(fs, unzipper, execSync)
      const bootstrapper = makeRancherBootstrapper(rancherRequests, config, wrapWithRetries, exec);
      await bootstrapper.runBootstrapper()

      return;
    }
    case 'SCALE': {
      const scaler = makeRancherScaler(rancherRequests, config);

      //Scale up or down
      console.log(`    scale: ${scale}`)
      switch (scale) {
        case 'UP': return scaler.scaleUp()
        case 'DOWN': return scaler.scaleDown()
      }

      //TODO: if config.nodes[].bootstrapScript exists:
      // 1. wait for nodes to be up and running
      // 2. run the `bootstrapScript`
    }
    default: {
      throw new Error(`Unhandled method: ${method}`);
    }
  }
}

main()