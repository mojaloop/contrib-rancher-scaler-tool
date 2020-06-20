/**
 * @function wrapWithRetries
 * @description - Call the given function with a number of retries.
 * @param {fn} func - Async function to be called with retries. This func must throw an error when it fails
 * @param {number} retries - Number of times to retry before returning an error if the func fails
 * @param {number} waitTimeMs - Ms time to wait before trying again
 */
async function wrapWithRetries (func: any, retries: number, waitTimeMs: number): Promise<any> {
  try {
    const result = await func()
    return Promise.resolve(result)
  } catch (err) {
    console.log(`wrapWithRetries failure: ${err.message}`)
    if (retries > 0) {
      // let retry wait job again
      return new Promise((resolve) => {
        setTimeout(() => resolve(wrapWithRetries(func, retries - 1, waitTimeMs)), waitTimeMs)
      })
    }

    console.error('wrapWithRetries Out of retries')
    return Promise.reject(err)
  }
}

export default wrapWithRetries
