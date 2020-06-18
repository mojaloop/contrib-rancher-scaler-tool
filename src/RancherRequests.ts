import { AxiosStatic } from 'axios';

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
    console.log("todo: get node pool", nodePoolId)

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

    console.log("todo: update node pool", nodePoolId, config)
  }
}

/* Dependency Injection */
const makeRancherRequests = (requests: AxiosStatic, cattleAccessKey: string, cattleSecretKey: string, rancherBaseUrl: string) => {
  const rancherRequests = new RancherRequests(requests, cattleAccessKey, cattleSecretKey, rancherBaseUrl);

  return rancherRequests;
}

export default makeRancherRequests;