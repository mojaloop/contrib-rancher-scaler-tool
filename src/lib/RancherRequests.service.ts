import axios from 'axios';
import fs from 'fs'
const Logger = require('@mojaloop/central-services-logger')

import { RancherRequests } from './RancherRequests';

const {
  RANCHER_BASE_URL: rancherBaseUrl,
  CATTLE_ACCESS_KEY: cattleAccessKey,
  CATTLE_SECRET_KEY: cattleSecretKey,
} = process.env;

describe('RancherRequests', () => {
  describe('downloadConfigForNodes', () => {
    it('downloads the config to a file', async () => {
      // Arrange
      const rancherRequests = new RancherRequests(fs, axios, Logger, cattleAccessKey!, cattleSecretKey!, rancherBaseUrl!);
      const nodeId = 'c-vsm2w:m-cgmr6'
      const configPath = `/tmp/keys.zip`
      
      // Act
      await rancherRequests.downloadConfigForNode(nodeId, configPath)
      
      // Assert
      //check file exists - throws if not found
      const stat = fs.statSync(configPath)
      expect(stat).not.toBe(undefined)
    })
  })
})