import { AxiosStatic, AxiosRequestConfig } from 'axios';
import { GetNodesForNodePoolResponse } from '../types/RancherRequestsTypes';


/**
 * @class RancherRequests
 * @description RancherRequests is responsible for executing API calls to the rancher api
 */
export class RancherRequests {
  fs: any;
  requests: AxiosStatic;
  logger: any
  cattleAccessKey: string;
  cattleSecretKey: string;
  rancherBaseUrl: string;
  baseRequestConfig: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    auth: {
      username: string,
      password: string,
    },
    baseURL: string,
  }

  constructor(
    fs: any,
    requests: AxiosStatic,
    logger: any,
    cattleAccessKey: string,
    cattleSecretKey: string,
    rancherBaseUrl: string
    ) {
    this.fs = fs;
    this.requests = requests;
    this.logger = logger;
    this.cattleAccessKey = cattleAccessKey;
    this.cattleSecretKey = cattleSecretKey;
    this.rancherBaseUrl = rancherBaseUrl;

    this.baseRequestConfig = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.cattleAccessKey,
        password: this.cattleSecretKey
      },
      baseURL: this.rancherBaseUrl
    }
  }

  /**
   * @function getNodePool
   * @description gets the node pool
   * @param nodePoolId
   */
  public async getNodePool(nodePoolId: string) {
    const requestConfig: AxiosRequestConfig = {
      ...this.baseRequestConfig,
      method: 'get',
      url: `/nodePools/${nodePoolId}`,
    }

    try {
      const response = await this.requests(requestConfig)
      // const url = `${this.rancherBaseUrl}/nodePools/${nodePoolId}`
      // const response = await this.requests.get(url)

      return response.data;
    } catch (err) {
      this.logger.error(`RancherRequests.getNodePool() Error: ${err.message}`)
      throw err;
    }
  }
  /**
   * @function getNodePool
   * @description gets the node pool
   * @param nodePoolId
   */
  public async putNodePoolQuantity(nodePoolId: string, config: { quantity: number, nodeTemplateId: string}) {
    /*
    curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
      -X PUT \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' \
      '.../v3/nodePools/c-vsm2w:np-mg5wr' \
      -d '{"quantity": 2, "nodeTemplateId": "cattle-global-nt:nt-user-s7l26-nt-2s4x5"}'
    */
    const requestConfig: AxiosRequestConfig = {
      ...this.baseRequestConfig,
      method: 'put',
      url: `/nodePools/${nodePoolId}`,
      data: {
        ...config
      }
    }

    const curlCommand = `
    curl -u "${this.baseRequestConfig.auth.username}:${this.baseRequestConfig.auth.password}" \
-X PUT \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
${this.baseRequestConfig.baseURL}${requestConfig.url} \
-d '{"quantity": ${config.quantity}, "nodeTemplateId": "${config.nodeTemplateId}"}'
`

    this.logger.debug(`CURL command is: \n${curlCommand}`)

    try {
      this.logger.debug(`putNodePoolQuantity::requestConfig - ${JSON.stringify(requestConfig)}`)
      const response = await this.requests(requestConfig)
      // this.logger.debug(`putNodePoolQuantity::response - ${JSON.stringify(response)}`)
      return response.data;
    } catch (err) {
      this.logger.error(`RancherRequests.putNodePoolQuantity() Error - ${err.message}`)
      if (err.response && err.response.data) {
        this.logger.error(`RancherRequests.putNodePoolQuantity() Error data - ${JSON.stringify(err.response.data)}`)
      }
      throw err;
    }
  }

  /**
   * @function getNodesForNodePool
   * @param nodePoolId
   */
  public async getNodesForNodePool(nodePoolId: string): Promise<GetNodesForNodePoolResponse> {
    /* .../v3/nodes/?nodePoolId=c-vsm2w%3Anp-mg5wr */
    const url = `${this.rancherBaseUrl}/nodes/?nodePoolId=${nodePoolId}`
    this.logger.debug(`getNodesForNodePool calling url: ${url}`)

    try {
      const response = await this.requests.get<GetNodesForNodePoolResponse>(url, this.baseRequestConfig)

      return response.data;
    } catch (err) {
      this.logger.error(`RancherRequests.getNodesForNodePool() Error - ${err.message}`)
      throw err;
    }
  }

  /**
   * @function downloadConfigForNodes
   * @description Download the nodeconfig for a set of nodes
   * @param nodePoolId
   * @param configPath
   */
  public async downloadConfigForNode(nodeId: string, configPath: string): Promise<any> {
    // curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" --location --request GET "${BASE_URL}/v3/nodes/c-kbc2d:m-26tkk/nodeconfig" -o /tmp/keys
    const requestConfig: AxiosRequestConfig = {
      ...this.baseRequestConfig,
      responseType: 'stream',
      method: 'get',
      url: `/nodes/${nodeId}/nodeconfig`,
    }

    try {
      const response = await this.requests(requestConfig)
      return new Promise((resolve, reject) => {
        response.data.pipe(this.fs.createWriteStream(configPath))
          .on('error', reject)
          .on('finish', () => resolve(configPath))
      })
    } catch (err) {
      this.logger.error(`RancherRequests.downloadConfigForNode() Error - ${err.message}`)
      throw err;
    }
  }
}

/* Dependency Injection */
const makeRancherRequests = (
  fs: any,
  requests: AxiosStatic,
  logger: any,
  cattleAccessKey: string,
  cattleSecretKey: string,
  rancherBaseUrl: string) => {
  const rancherRequests = new RancherRequests(fs, requests, logger, cattleAccessKey, cattleSecretKey, rancherBaseUrl);

  return rancherRequests;
}

export default makeRancherRequests;
