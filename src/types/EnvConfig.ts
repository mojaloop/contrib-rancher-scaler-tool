type EnvConfig = {
  cattleAccessKey: string;
  cattleSecretKey: string;
  scale: 'UP' | 'DOWN',
  pathToConfig: string;
}

export default EnvConfig