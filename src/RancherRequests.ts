import { AxiosStatic, AxiosRequestConfig } from 'axios';
import { GetNodesForNodePoolResponse } from './types/RancherRequestsTypes';


/**
 * @class RancherRequests
 * @description RancherRequests is responsible for executing API calls to the rancher api
 */
export class RancherRequests {
  requests: AxiosStatic;
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

  constructor(requests: AxiosStatic, cattleAccessKey: string, cattleSecretKey: string, rancherBaseUrl: string) {
    this.requests = requests;
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

    // console.log('config', requestConfig)

    try {
      const response = await this.requests(requestConfig)
      // const url = `${this.rancherBaseUrl}/nodePools/${nodePoolId}`
      // const response = await this.requests.get(url)

      return response.data;
    } catch (err) {
      console.log("RancherRequests.getNodePool() Error", err.message)
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
    // console.log("requestConfig is", requestConfig)

    try {
      const response = await this.requests(requestConfig)
      
      return response.data;
    } catch (err) {
      console.log("RancherRequests.putNodePoolQuantity() Error", err)
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

    try {
      const response = await this.requests.get<GetNodesForNodePoolResponse>(url, this.baseRequestConfig)

      console.log('getNodesForNodePool, response.data', response.data.data)

      return response.data;
    } catch (err) {
      console.log("RancherRequests.getNodesForNodePool() Error", err.message)
      throw err;
    }
  }
}

/* Dependency Injection */
const makeRancherRequests = (requests: AxiosStatic, cattleAccessKey: string, cattleSecretKey: string, rancherBaseUrl: string) => {
  const rancherRequests = new RancherRequests(requests, cattleAccessKey, cattleSecretKey, rancherBaseUrl);

  return rancherRequests;
}

export default makeRancherRequests;