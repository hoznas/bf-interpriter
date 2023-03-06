export abstract class AbstractInput {
  abstract getCharCode(): number;
}

export class StringInput extends AbstractInput {
  inputStr: string;
  pointer: number;
  constructor(input: string) {
    super();
    this.inputStr = input;
    this.pointer = 0;
  }
  getCharCode(): number {
    if (this.pointer < this.inputStr.length) {
      const ch = this.inputStr.charCodeAt(this.pointer);
      this.pointer++;
      return ch;
    }
    return 0;
  }
}
export abstract class AbstractOutput {
  abstract putCharCode(charCode: number): void;
}

export class StringOutput extends AbstractOutput {
  putCharCode(charCode: number): void {
    const c = String.fromCharCode(charCode);
    process.stdout.write(c);
  }
}
