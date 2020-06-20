

export class Exec {
  // TODO: make these _not_ any
  private fs: any;
  private unzipper: any;
  private execSync: any;
  private logger: any;

  constructor(fs: any, unzipper: any, execSync: any, logger: any) {
    this.fs = fs;
    this.unzipper = unzipper;
    this.execSync = execSync;
    this.logger = logger;
  }

  public async unzip(zipPath: string, outputPath: string): Promise<void> {
    try {
      this.fs.mkdirSync(outputPath)
    } catch (err) {
      if (err.message.indexOf('EEXIST') > -1) {
        console.log(`mkdirSync ignoring as folder exists`)
      } else {
        throw err;
      }
    }

    const directory = await this.unzipper.Open.file(zipPath);
    const files = await Promise.all(directory.files.map((file: any) => this._writeFile(file, outputPath)))
    console.log('Exec.unzip - unzipped the following files: ', files)

    return;
  }

  public async _writeFile(file: any, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const fullPath = `${outputPath}/${file.path.split('/').pop()}`;
      file
        .stream()
        .pipe(this.fs.createWriteStream(fullPath))
        .on('error', reject)
        .on('finish', () => resolve(fullPath))
    });
  }

  public async runInSsh(keypath: string, username: string, host: string, script: string) {
    // ssh-keyscan -H $HOST >> ~/.ssh/known_hosts
    const keyscanCommand = `ssh-keyscan -H ${host} >> ~/.ssh/known_hosts`
    const command = `ssh -i ${keypath} ${username}@${host} "${script}"`

    try {
      this.logger.debug('Exec.runInSsh - adding hosts to ~/.ssh/known_hosts')
      this.logger.debug(`Exec.runInSsh - running: ${keyscanCommand}`)
      this.execSync(keyscanCommand)
      this.logger.info(`Exec.runInSsh - running: ${command}`)
      const result = this.execSync(command)
      return result.toString()
    } catch (err) {
      // This is thrown on any non-zero exit code... nice!
      this.logger.error(`Exec.runInSsh - ${err}`)
      throw err;
    }
  }
}

/* Dependency Injection */
const makeExec = (fs: any, unzipper: any, execSync: any, logger: any): Exec => {
  const exec = new Exec(fs, unzipper, execSync, logger);

  return exec
}

export default makeExec;