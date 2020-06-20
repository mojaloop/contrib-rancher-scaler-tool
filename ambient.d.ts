declare module '@mojaloop/central-services-logger' {
  namespace Logger {
    export function info(thing: string): void
    export function debug(thing: string): void
    export function error(thing: string): void
  } 

  export default Logger

} 


