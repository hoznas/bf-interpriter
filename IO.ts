import fs from 'fs';

export class InputStream {
  private i = 0;
  constructor(private inputString = fs.readFileSync('/dev/stdin').toString()) {}
  read() {
    return this.i < this.inputString.length
      ? this.inputString.charCodeAt(this.i++)
      : 0;
  }
}
