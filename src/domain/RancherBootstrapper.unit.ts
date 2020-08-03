import makeRancherBootstrapper, { RancherBootstrapper } from "./RancherBootstrapper"
import RancherScalerConfigType from '../types/RancherScalerConfigType'
import { ActionEnum } from '../types/ActionEnum'
import wrapWithRetries from '../lib/WrapWithRetries'
import { BootstrapHookType } from '../types/HookTypes'

const mock_logger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}

const mock_rancherRequests = {
  putNodePoolQuantity: jest.fn()
}

const mock_hooksHandler = {
  runHooks: jest.fn()
}

const mock_exec = {
  unzip: jest.fn(),
  _writeFile: jest.fn(),
  setupSsh: jest.fn(),
  runInSsh: jest.fn(),
}

// Wrapper around wrapWithRetries that overrides the values
const mock_wrapWithRetries = (func: () => any, retries: number, waitTimeMs: number, waitTimeScale: number = 1): Promise<any> => {
  return wrapWithRetries(func, 5, 10);
}

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

describe('RancherBootstrapper', () => {
  describe('runScriptForNodePool', () => {
    it('waits for the node pool, then runs calls `_runBootstrapForNodePool`', async () => {
      // Arrange
      const mock_runBootstrapForNodePool = jest.spyOn(RancherBootstrapper.prototype, '_runBootstrapForNodePool')
      mock_runBootstrapForNodePool.mockResolvedValueOnce()
      const mock_isNodePoolReady = jest.spyOn(RancherBootstrapper.prototype, '_isNodePoolReady')
      mock_isNodePoolReady.mockResolvedValueOnce(true)

      // @ts-ignore
      const rb = makeRancherBootstrapper(mock_rancherRequests, config, wrapWithRetries, (timeMs) => Promise.resolve(), mock_exec, mock_logger)
      const bootstrapHook: BootstrapHookType = {
        hookType: ActionEnum.RUN_STARTUP_SCRIPT,
        script: 'lsof -i -n -P',
        rebootOnEnd: false,
      }

      // Act
      await rb.runScriptForNodePool(config.nodes[0].nodePoolId, bootstrapHook)

      // Assert
      expect(mock_isNodePoolReady).toHaveBeenCalledTimes(1)
      expect(mock_runBootstrapForNodePool).toHaveBeenCalledTimes(1)
    })

    it('runs out of retries', async () => {
      // Arrange
      const mock_runBootstrapForNodePool = jest.spyOn(RancherBootstrapper.prototype, '_runBootstrapForNodePool')
      mock_runBootstrapForNodePool.mockResolvedValueOnce()
      const mock_isNodePoolReady = jest.spyOn(RancherBootstrapper.prototype, '_isNodePoolReady')
      mock_isNodePoolReady.mockRejectedValue(new Error('Test retries'))

      // @ts-ignore
      const rb = makeRancherBootstrapper(mock_rancherRequests, config, mock_wrapWithRetries, (timeMs) => Promise.resolve(), mock_exec, mock_logger)
      const bootstrapHook: BootstrapHookType = {
        hookType: ActionEnum.RUN_STARTUP_SCRIPT,
        script: 'lsof -i -n -P',
        rebootOnEnd: false,
      }

      // Act
      const action = async () => await rb.runScriptForNodePool(config.nodes[0].nodePoolId, bootstrapHook)

      // Assert
      await expect(action).rejects.toThrowError('Test retries')
      expect(mock_isNodePoolReady).toHaveBeenCalledTimes(6)
      expect(mock_runBootstrapForNodePool).toHaveBeenCalledTimes(0)
    })
  })

  // TODO: keep expanding tests!
  // describe('_isNodePoolReady')
  // describe('_runBootstrapForNodePool')
  // describe('_runBootstrapForNode')
})
