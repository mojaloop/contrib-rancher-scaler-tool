
const sleep = (waitTimeMs: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), waitTimeMs)
  })
}

export default sleep
