type EnvConfig = {
  rancherBaseUrl: string;
  cattleAccessKey: string;
  cattleSecretKey: string;
  scale: 'UP' | 'DOWN',
  pathToConfig: string;
  method: 'VERIFY' | 'SCALE' | 'BOOTSTRAP'
}

export default EnvConfig