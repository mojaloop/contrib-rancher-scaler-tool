

export class Exec {
  private fs: any;
  private unzipper: any;
  private execSync: any;

  constructor(fs: any, unzipper: any, execSync: any) {
    this.fs = fs;
    this.unzipper = unzipper;
    this.execSync = execSync;
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
    const command = `ssh -i ${keypath}  ${username}@${host} "${script}"`
    this.execSync(command)
    //TODO: error handling?
  }

}

/* Dependency Injection */
const makeExec = (fs: any, unzipper: any, execSync: any): Exec => {
  const exec = new Exec(fs, unzipper, execSync);

  return exec
}

export default makeExec;