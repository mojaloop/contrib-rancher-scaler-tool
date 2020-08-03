import path from 'path'
export interface EnvConfig {
  rancherBaseUrl: string;
  cattleAccessKey: string;
  cattleSecretKey: string;
  scale: 'UP' | 'DOWN';
  pathToConfig: string;
  method: Method
  // Optional
  slackWebhookUrl?: string;
  // awsAccessKeyId?: string;
  // awsSecretAccessKey?: string;
  awsRegion?: string;
}


export enum Method {
  SCALE='SCALE',
  VERIFY='VERIFY',
  BOOTSTRAP='BOOTSTRAP',
  PRE_SCALE_UP_GLOBAL ='PRE_SCALE_UP_GLOBAL',
  PRE_SCALE_DOWN_GLOBAL ='PRE_SCALE_DOWN_GLOBAL',
  POST_SCALE_UP_GLOBAL ='POST_SCALE_UP_GLOBAL',
  POST_SCALE_DOWN_GLOBAL ='POST_SCALE_DOWN_GLOBAL',
}

/**
 * @function getEnvConfig
 * @description Gets the necessary env config, throws if not found or invalid.
 */
function getEnvConfig(): EnvConfig {
  const {
    RANCHER_BASE_URL,
    CATTLE_ACCESS_KEY,
    CATTLE_SECRET_KEY,
    METHOD,
    PATH_TO_CONFIG,
    SLACK_WEBHOOK_URL: slackWebhookUrl,
  } = process.env;
  let { SCALE } = process.env;

  let method: Method
  switch (METHOD) {
    case 'VERIFY':
      method = Method.VERIFY
      break;
    case 'BOOTSTRAP':
      method = Method.BOOTSTRAP
      break;
    case 'PRE_SCALE_UP_GLOBAL':
      method = Method.PRE_SCALE_UP_GLOBAL
      break;
    case 'PRE_SCALE_DOWN_GLOBAL':
      method = Method.PRE_SCALE_DOWN_GLOBAL
      break;
    case 'POST_SCALE_UP_GLOBAL':
      method = Method.POST_SCALE_UP_GLOBAL
      break;
    case 'POST_SCALE_DOWN_GLOBAL':
      method = Method.POST_SCALE_DOWN_GLOBAL
      break;
    default:
      // default for backwards compatibility
      method = Method.SCALE
  }

  if (!RANCHER_BASE_URL) {
    throw new Error('RANCHER_BASE_URL must be set.')
  }

  if (!CATTLE_ACCESS_KEY || !CATTLE_SECRET_KEY) {
    throw new Error('CATTLE_ACCESS_KEY and CATTLE_SECRET_KEY must be set.')
  }

  let scale: 'DOWN' | 'UP' = 'DOWN'
  if (METHOD === 'SCALE') {
    if (!SCALE) {
      throw new Error('SCALE must be set')
    }

    if (SCALE !== 'UP' && SCALE !== 'DOWN') {
      throw new Error('SCALE must be `UP` or `DOWN`')
    }
    scale = SCALE
  }

  const configFile = PATH_TO_CONFIG || './config/rancher-scaler.config.js'
  const pathToConfig = path.resolve(__dirname, '../../', configFile);

  return {
    rancherBaseUrl: RANCHER_BASE_URL,
    cattleAccessKey: CATTLE_ACCESS_KEY,
    cattleSecretKey: CATTLE_SECRET_KEY,
    scale,
    method,
    pathToConfig,
    slackWebhookUrl,
    awsRegion
    // awsAccessKeyId,
    // awsSecretAccessKey,
  };
}

export default getEnvConfig
