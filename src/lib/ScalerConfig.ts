import RancherScalerConfigType from "../types/RancherScalerConfigType";


export class ScalerConfig {
  validator: (input: any) => RancherScalerConfigType;

  constructor(validator: any) {
    this.validator = validator
  }

  /**
   * @function getConfig
   * @description Gets the config from a file, and ensures it's valid
   * @param pathToConfig 
   */
  getConfig(pathToConfig: string): RancherScalerConfigType {
    const config: any = require(pathToConfig)

    if (!config) {
      throw new Error(`no config found at path: ${pathToConfig}`)
    }

    //TODO: validation
    return this.validator(config)
  }
}

const makeScalerConfig = (validator: (input: any) => RancherScalerConfigType): ScalerConfig => {
  const scalerConfig = new ScalerConfig(validator);

  return scalerConfig;
}

export default makeScalerConfig;