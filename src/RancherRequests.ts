import { AxiosStatic, AxiosRequestConfig } from 'axios';

/**
 * @class RancherRequests
 * @description RancherRequests is responsible for executing API calls to the rancher api
 */
export class RancherRequests {
  requests: AxiosStatic;
  cattleAccessKey: string;
  cattleSecretKey: string;
  rancherBaseUrl: string;

  constructor(requests: AxiosStatic, cattleAccessKey: string, cattleSecretKey: string, rancherBaseUrl: string) {
    this.requests = requests;
    this.cattleAccessKey = cattleAccessKey;
    this.cattleSecretKey = cattleSecretKey;
    this.rancherBaseUrl = rancherBaseUrl;
  }

  /**
   * @function getNodePool
   * @description gets the node pool
   * @param nodePoolId 
   */
  public async getNodePool(nodePoolId: string) {
    const requestConfig: AxiosRequestConfig = {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.cattleAccessKey,
        password: this.cattleSecretKey,
      },
      baseURL: this.rancherBaseUrl,
      url: `/nodePools/${nodePoolId}`
    }
    // console.log("requestConfig is", requestConfig)

    try {
      const response = await this.requests(requestConfig)

      return response.data;
    } catch (err) {
      console.log("RancherRequests.getNodePool() Error", err)
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
      'https://k8s-tanuki-rancher.mojaloop.live/v3/nodePools/c-vsm2w:np-mg5wr' \
      -d '{"quantity": 2, "nodeTemplateId": "cattle-global-nt:nt-user-s7l26-nt-2s4x5"}'
    */

    const requestConfig: AxiosRequestConfig = {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.cattleAccessKey,
        password: this.cattleSecretKey,
      },
      baseURL: this.rancherBaseUrl,
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
}

/* Dependency Injection */
const makeRancherRequests = (requests: AxiosStatic, cattleAccessKey: string, cattleSecretKey: string, rancherBaseUrl: string) => {
  const rancherRequests = new RancherRequests(requests, cattleAccessKey, cattleSecretKey, rancherBaseUrl);

  return rancherRequests;
}

export default makeRancherRequests;