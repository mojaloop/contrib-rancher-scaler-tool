import { Method } from 'config';

interface EnvConfig {
  rancherBaseUrl: string;
  cattleAccessKey: string;
  cattleSecretKey: string;
  scale: 'UP' | 'DOWN';
  pathToConfig: string;
  method: Method
}

export default EnvConfig
