import fs from 'fs'
import unzipper from 'unzipper'
import { execSync } from 'child_process'
import { Exec } from "./Exec"

describe('Exec', () => {
  describe('unzip',  () => {
    it('unzips a file', async () => {
      // Arrange
      const zipPath = `/tmp/rs-keys-worker1.zip`
      const outputDir = `/tmp/rs-keys-worker1`
      const exec = new Exec(fs, unzipper, execSync)
      
      // Act
      await exec.unzip(zipPath, outputDir)
      
      // Assert
    })
  })
})