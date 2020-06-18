import makeRancherScaler from './RancherScaler'
import makeRancherRequests from './RancherRequests'
import axios from 'axios'
import EnvConfig from './types/EnvConfig';

/**
 * @function getEnvConfig
 * @description Gets the necessary env config, throws if not found or invalid.
 */
function getEnvConfig(): EnvConfig {
  const {
    CATTLE_ACCESS_KEY,
    CATTLE_SECRET_KEY,
    SCALE,
    PATH_TO_CONFIG
  } = process.env;

  if (!CATTLE_ACCESS_KEY || !CATTLE_SECRET_KEY ) {
    throw new Error('CATTLE_ACCESS_KEY and CATTLE_SECRET_KEY must be set.')
  }

  if (!SCALE) {
    throw new Error('SCALE must be set')
  }
  
  if (SCALE !== 'UP' && SCALE !== 'DOWN') {
    throw new Error('SCALE must be `UP` or `DOWN`')
  }

  let pathToConfig
  if (!PATH_TO_CONFIG) {
    pathToConfig = '../config/rancher-scaler.config.js';
  } else {
    pathToConfig = PATH_TO_CONFIG
  }

  return { 
    cattleAccessKey: CATTLE_ACCESS_KEY,
    cattleSecretKey: CATTLE_SECRET_KEY,
    scale: SCALE,
    pathToConfig,
  };
}

function main() {
  const {
    cattleAccessKey,
    cattleSecretKey,
    scale,
    pathToConfig,
  } = getEnvConfig()

  const config = require(pathToConfig)

  if (!config) {
    throw new Error(`no config found at path: ${pathToConfig}`)
  }

  //TODO: validate the config

  const rancherRequests = makeRancherRequests(axios, cattleAccessKey, cattleSecretKey, config.rancherBaseUrl);
  const scaler = makeRancherScaler(rancherRequests, config);

  //Scale up or down
  switch (scale) {
    case 'UP': return scaler.scaleUp()
    case 'DOWN': return scaler.scaleDown()
  }

  //TODO: if config.nodes[].bootstrapScript exists:
  // 1. wait for nodes to be up and running
  // 2. run the `bootstrapScript`
}

main()