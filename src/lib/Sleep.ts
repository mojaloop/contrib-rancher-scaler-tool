
const sleep = (waitTimeMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), waitTimeMs)
  })
}

export default sleep