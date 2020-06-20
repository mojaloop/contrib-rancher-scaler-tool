export class Exec {
  // TODO: make these strictly typed
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
        this.logger.debug(`mkdirSync ignoring as folder exists`)
      } else {
        throw err;
      }
    }

    const directory = await this.unzipper.Open.file(zipPath);
    const files = await Promise.all(directory.files.map((file: any) => this._writeFile(file, outputPath)))
    this.logger.debug('Exec.unzip - unzipped the following files: ', files)

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
    const chmodCommand = `chmod 644 ${keypath}`
    const keyscanCommand = `mkdir -p ~/.ssh/ && ssh-keyscan -H ${host} >> ~/.ssh/known_hosts`
    const sshCommand = `ssh -i ${keypath} ${username}@${host} "${script}"`

    try {
      this.logger.debug('Exec.runInSsh - changing file permissions')
      this.logger.debug(`Exec.runInSsh - running: ${chmodCommand}`)
      this.execSync(chmodCommand)
      
      this.logger.debug('Exec.runInSsh - adding hosts to ~/.ssh/known_hosts')
      this.logger.debug(`Exec.runInSsh - running: ${keyscanCommand}`)
      this.execSync(keyscanCommand)

      this.logger.info(`Exec.runInSsh - running: ${sshCommand}`)
      const result = this.execSync(sshCommand)
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