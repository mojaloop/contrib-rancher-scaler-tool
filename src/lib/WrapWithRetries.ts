// eslint-disable-next-line @typescript-eslint/no-var-requires
const Logger = require('@mojaloop/central-services-logger')

/**
 * @function wrapWithRetries
 * @description - Call the given function with a number of retries.
 * @param {fn} func - Async function to be called with retries. This func must throw an error when it fails
 * @param {number} retries - Number of times to retry before returning an error if the func fails
 * @param {number} waitTimeMs - Ms time to wait before trying again
 * @param {number} waitTimeScale - Optional - Number to scale wait time by each iteration (e.g. a `waitTimeScale` of 2 will
 *   double the wait time each iteration)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function wrapWithRetries (func: () => any, retries: number, waitTimeMs: number, waitTimeScale: number = 1): Promise<any> {
  try {
    const result = await func()
    return Promise.resolve(result)
  } catch (err) {
    Logger.debug(`wrapWithRetries failure: ${err.message}`)
    if (retries > 0) {
      // let retry wait job again
      return new Promise((resolve) => {
        setTimeout(() => resolve(wrapWithRetries(func, retries - 1, waitTimeMs, waitTimeScale)), waitTimeMs)
      })
    }

    Logger.info('wrapWithRetries Out of retries')
    return Promise.reject(err)
  }
}

export default wrapWithRetries
