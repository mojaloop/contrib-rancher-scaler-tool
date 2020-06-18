import makeRancherScaler from './RancherScaler'
import makeRancherRequests from './RancherRequests'
import axios from 'axios'
import RancherScalerConfigType from 'types/RancherScalerConfigType';
import getEnvConfig from './config';

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
  const rancherRequests = makeRancherRequests(axios, cattleAccessKey, cattleSecretKey, rancherBaseUrl);
  console.log(`Running method: ${method}`)
  switch (method) {
    case 'VERIFY': {
      // Verify that the config works by calling `getNodePool`
      const result = await rancherRequests.getNodePool(config.nodes[0].nodePoolId)
      console.log('getNodePool reply', result)
      break;
    }
    // TODO: maybe we don't need/want this
    case 'RUN_SCRIPT': {
      //TODO: implement
      console.log('Running script or something')
      break
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

  return;
}

main()