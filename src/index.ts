
// TODO: better specify the config...
// @ts-ignore
import config from '../config/rancher-scaler.config.js'
import makeRancherScaler from './RancherScaler'
import makeRancherRequests from './RancherRequests'
import axios from 'axios'


// Entrypoint for rancher-scaler
// TODO: refactor and modularize etc.

type EnvConfig = {
  cattleAccessKey: string;
  cattleSecretKey: string;
  scale: 'UP' | 'DOWN',
}

/**
 * @function getEnvConfig
 * @description Gets the necessary env config, throws if not found or invalid.
 */
function getEnvConfig(): EnvConfig {
  const {
    CATTLE_ACCESS_KEY,
    CATTLE_SECRET_KEY,
    SCALE,
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

  return { 
    cattleAccessKey: CATTLE_ACCESS_KEY,
    cattleSecretKey: CATTLE_SECRET_KEY,
    scale: SCALE
  };
}

function main() {
  const {
    cattleAccessKey,
    cattleSecretKey,
    scale,
  } = getEnvConfig()

  //TODO: validate the config
  //TODO: send a slack notification?

  const rancherRequests = makeRancherRequests(axios, cattleAccessKey, cattleSecretKey, config.rancherBaseUrl);
  const scaler = makeRancherScaler(rancherRequests, config);

  //Scale up or down
  switch (scale) {
    case 'UP': return scaler.scaleUp()
    case 'DOWN': return scaler.scaleDown()
  }
}

main()