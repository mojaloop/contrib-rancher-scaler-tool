import fs from 'fs'
import unzipper from 'unzipper'
import { execSync } from 'child_process'
import makeExec, { Exec } from "./Exec"
const Logger = require('@mojaloop/central-services-logger')

describe('Exec', () => {
  // Manual run only
  describe.skip('unzip',  () => {
    it('unzips a file', async () => {
      // Arrange
      const zipPath = `/tmp/rs-keys-worker1.zip`
      const outputDir = `/tmp/rs-keys-worker1`
      const exec = new Exec(fs, unzipper, execSync, Logger)
      
      // Act
      await exec.unzip(zipPath, outputDir)
      
      // Assert
    })
  })

  describe.skip('runInSsh', () => {
    // Manual run only
    it('Runs a shell script in an ssh session', async () => {
      // Arrange
      const exec = new Exec(fs, unzipper, execSync, Logger)
      const keypath = '/Users/lewisdaly/.ssh/id_rsa';
      const username = 'root'
      const host = process.env.TEST_HOST
      const script = 'echo "HELLO WORLD"; wget https://google.com/ -O /tmp/hello; cat /tmp/hello'
      // const script = "exit 0"

      // Act
      const result = await exec.runInSsh(keypath, username, host!, script)
      
      // Assert
      console.log(result)
    })
  })
})