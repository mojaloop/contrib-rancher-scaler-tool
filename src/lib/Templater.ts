import LoggerType from '../types/LoggerType';
import RancherScalerConfigType from 'types/RancherScalerConfigType';


export type TemplateConfigNode = {
  minQuantity: number;
  maxQuantity: number;
  nodePoolId: string;
}

export type TemplateConfig = {
  totalNodePools: number,
  nodes: {[index: string]: TemplateConfigNode}
}

// function templater(input: string): string {
//   return input;
// }

export class Templater {
  private logger: LoggerType;
  private config: TemplateConfig;

  constructor(logger: LoggerType, config: TemplateConfig) {
    this.logger = logger;
    this.config = config;
  }

  public static transformConfigToTemplateConfig(input: RancherScalerConfigType): TemplateConfig {
    const nodes = {};
    input.nodes.map(node => ({
      minQuantity: node.minQuantity,
      maxQuantity: node.maxQuantity,
      nodePoolId: node.nodePoolId,
    }))
    .forEach(mapped => nodes[mapped.nodePoolId] = mapped)

    return {
      totalNodePools: input.nodes.length,
      nodes
    }
  }

  replace(input: string, nodePoolId?: string): string {
    this.logger.debug(`Templater.replace - replacing input: ${input} (nodePoolId)${nodePoolId}`);

    const replacements: Array<{input: string, output: string | number }> = [
      { input: '{{totalNodePools}}', output: this.config.totalNodePools }
    ]

    if (nodePoolId && this.config.nodes[nodePoolId]) {
      this.logger.debug(`Templater.replace - context is nodePoolId: ${nodePoolId}`);
      const nodePoolConfig = this.config.nodes[nodePoolId];

      replacements.push(
        { input: '{{minQuantity}}', output: nodePoolConfig.minQuantity },
        { input: '{{maxQuantity}}', output: nodePoolConfig.maxQuantity },
        { input: '{{nodePoolId}}', output: nodePoolConfig.nodePoolId },
      );
    }

    const output = replacements.reduce((acc: string, curr) => {
      return acc.replace(curr.input, `${curr.output}`)
    }, input)

    this.logger.debug(`Templater.replace - output is: ${output}`);

    return output;
  }
}

const makeTemplater = (logger: LoggerType, config: TemplateConfig) => {
  const templater = new Templater(logger, config);

  return templater;
}

export default makeTemplater;
