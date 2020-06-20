// TODO: how do we put these in `ambient.d.ts`?
type LoggerType = {
  info(thing: string): void
  debug(thing: string): void
  error(thing: string): void
}

export default LoggerType;