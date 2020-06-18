type EnvConfig = {
  rancherBaseUrl: string;
  cattleAccessKey: string;
  cattleSecretKey: string;
  scale: 'UP' | 'DOWN',
  pathToConfig: string;
  method: 'VERIFY' | 'SCALE' | 'RUN_SCRIPT'
}

export default EnvConfig