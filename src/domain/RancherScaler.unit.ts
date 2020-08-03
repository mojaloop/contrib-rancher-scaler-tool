import { RancherScaler } from "./RancherScaler"
import RancherScalerConfigType from '../types/RancherScalerConfigType'
import { ActionEnum } from '../types/ActionEnum'

const mockLogger = {
  info: jest.fn(),
  error: jest.fn()
}

const mock_rancherRequests = {
  putNodePoolQuantity: jest.fn()
}

const mock_hooksHandler = {
  runHooks: jest.fn()
}

describe('RancherScaler', () => {
  describe('scaleUp', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('scales up sucessfully', async () => {
      // Arrange
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
          }
        ]
      }
      //@ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 5, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      await rs.scaleUp();

      // Assert
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_rancherRequests.putNodePoolQuantity).toBeCalledWith('nodePoolId_12345', expectedPutNodePool)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })

    it('runs the node hooks', async () => {
      // Arrange
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      //@ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 5, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      await rs.scaleUp();

      // Assert
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledWith('nodePoolId_12345', expectedPutNodePool)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledWith(config.nodes[0].hooks?.preScaleUp, 'nodePoolId_12345')
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledWith([], 'nodePoolId_12345')

    })

    it('handles an error with rancher', async () => {
      // Arrange
      mock_rancherRequests.putNodePoolQuantity.mockRejectedValueOnce(new Error('Rancher Error'))
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 5, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      const action = async () => await rs.scaleUp();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleUp - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_rancherRequests.putNodePoolQuantity).toBeCalledWith('nodePoolId_12345', expectedPutNodePool)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })

    it('handles an error running pre hooks', async () => {
      // Arrange
      mock_hooksHandler.runHooks.mockRejectedValueOnce(new Error('Pre hooks Error'))
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 5, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      const action = async () => await rs.scaleUp();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleUp - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(0)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })

    it('handles an error running post hooks', async () => {
      // Arrange
      mock_hooksHandler.runHooks
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('post hooks Error'))

      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)

      // Act
      const action = async () => await rs.scaleUp();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleUp - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(3)
    })

    it('handles an error running error hook', async () => {
      // Arrange
      mock_rancherRequests.putNodePoolQuantity.mockRejectedValueOnce(new Error('Rancher Error'))
      mock_hooksHandler.runHooks
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('post hooks Error'))

      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)

      // Act
      const action = async () => await rs.scaleUp();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleUp - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })
  })

  describe('scaleDown', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('scales down sucessfully', async () => {
      // Arrange
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
          }
        ]
      }
      //@ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 1, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      await rs.scaleDown();

      // Assert
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_rancherRequests.putNodePoolQuantity).toBeCalledWith('nodePoolId_12345', expectedPutNodePool)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })

    it('runs the node hooks', async () => {
      // Arrange
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      //@ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 1, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      await rs.scaleDown();

      // Assert
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledWith('nodePoolId_12345', expectedPutNodePool)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledWith(config.nodes[0].hooks?.preScaleDown, 'nodePoolId_12345')
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledWith([], 'nodePoolId_12345')

    })

    it('handles an error with rancher', async () => {
      // Arrange
      mock_rancherRequests.putNodePoolQuantity.mockRejectedValueOnce(new Error('Rancher Error'))
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 1, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      const action = async () => await rs.scaleDown();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleDown - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_rancherRequests.putNodePoolQuantity).toBeCalledWith('nodePoolId_12345', expectedPutNodePool)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })

    it('handles an error running pre hooks', async () => {
      // Arrange
      mock_hooksHandler.runHooks.mockRejectedValueOnce(new Error('Pre hooks Error'))
      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)
      const expectedPutNodePool = { quantity: 1, nodeTemplateId: 'nodeTemplateId_67890' }

      // Act
      const action = async () => await rs.scaleDown();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleDown - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(0)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })

    it('handles an error running post hooks', async () => {
      // Arrange
      mock_hooksHandler.runHooks
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('post hooks Error'))

      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)

      // Act
      const action = async () => await rs.scaleDown();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleDown - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(3)
    })

    it('handles an error running error hook', async () => {
      // Arrange
      mock_rancherRequests.putNodePoolQuantity.mockRejectedValueOnce(new Error('Rancher Error'))
      mock_hooksHandler.runHooks
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('post hooks Error'))

      const config: RancherScalerConfigType = {
        global: {},
        nodes: [
          {
            nodePoolId: 'nodePoolId_12345',
            nodeTemplateId: 'nodeTemplateId_67890',
            minQuantity: 1,
            maxQuantity: 5,
            hooks: {
              preScaleUp: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale up'
                }
              ],
              preScaleDown: [
                {
                  hookType: ActionEnum.SLACK_NOTIFICATION,
                  contents: 'Test slack message pre scale down'
                }
              ]
            }
          }
        ]
      }
      // @ts-ignore
      const rs = new RancherScaler(mock_rancherRequests, mockLogger, mock_hooksHandler, config)

      // Act
      const action = async () => await rs.scaleDown();

      // Assert
      await expect(action).rejects.toThrowError('RancherScaler.scaleDown - finished running with errors')
      expect(mock_rancherRequests.putNodePoolQuantity).toHaveBeenCalledTimes(1)
      expect(mock_hooksHandler.runHooks).toHaveBeenCalledTimes(2)
    })
  })
})
