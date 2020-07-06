import LoggerType from 'types/LoggerType';

export class Exec {
  // TODO: make these strictly typed
  private fs: any;
  private unzipper: any;
  private execSync: any;
  private logger: LoggerType;

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
    // const files = await Promise.all(directory.files.map(async (file: any) => await this._writeFile(file, outputPath)))
    const files: Array<string> = []
    await directory.files.reduce(async (acc: Promise<void>, file: any) => {
      await acc;
      const fileName = await this._writeFile(file, outputPath);
      return files.push(fileName);
    }, Promise.resolve([]))

    this.logger.debug(`Exec.unzip - unzipped the following files:\n${JSON.stringify(files)}`)

    return;
  }

  //TODO: fix this to return the filename...
  public async _writeFile(file: any, outputPath: string): Promise<string> {
    const fullPath = `${outputPath}/${file.path.split('/').pop()}`;
    return new Promise((resolve, reject) => {
      file
        .stream()
        .pipe(this.fs.createWriteStream(fullPath))
        .on('error', reject)
        .on('finish',resolve)
    })
    .then(() => fullPath)
  }

  public async setupSsh(keypath: string, username: string, host: string, script: string): Promise<string> {
    // ssh-keyscan -H $HOST >> ~/.ssh/known_hosts
    const chmodCommand = `chmod 600 ${keypath}`
    const keyscanCommand = `mkdir -p ~/.ssh/ && ssh-keyscan -H ${host} >> ~/.ssh/known_hosts`

    try {
      this.logger.debug('Exec.setupSsh - changing file permissions')
      this.logger.debug(`Exec.setupSsh - running: ${chmodCommand}`)
      const chmodBuffer = this.execSync(chmodCommand)
      this.logger.debug(`Exec.setupSsh output: ${chmodBuffer.toString()}`)

      this.logger.debug('Exec.setupSsh - adding hosts to ~/.ssh/known_hosts')
      this.logger.debug(`Exec.setupSsh - running: ${keyscanCommand}`)
      const keyscanBuffer = this.execSync(keyscanCommand)
      this.logger.debug(`Exec.setupSsh output: ${keyscanBuffer.toString()}`)

      return keyscanBuffer.toString();
    }
    catch (err) {
      // This is thrown on any non-zero exit code... nice!
      this.logger.error(`Exec.setupSsh - ${err}`)
      throw new Error('Exec.setupSsh failed.')
    }
  }

  public async runInSsh(keypath: string, username: string, host: string, script: string): Promise<string> {
    const sshCommand = `ssh -i ${keypath} ${username}@${host} "${script}"`

    try {
      this.logger.info(`Exec.runInSsh - running: ${sshCommand}`)
      const result = this.execSync(sshCommand)
      return result.toString()
    } catch (err) {
      // This is thrown on any non-zero exit code... nice!
      this.logger.error(`Exec.runInSsh - ${err}`)
      throw new Error('Exec.runInSsh failed.')
    }
  }
}

/* Dependency Injection */
const makeExec = (fs: any, unzipper: any, execSync: any, logger: LoggerType): Exec => {
  const exec = new Exec(fs, unzipper, execSync, logger);

  return exec
}

export default makeExec;
