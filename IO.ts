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
  abstract flush(): void;
}

export class StringOutput extends AbstractOutput {
  buffer: string;
  constructor() {
    super();
    this.buffer = '';
  }
  putCharCode(charCode: number): void {
    const c = String.fromCharCode(charCode);
    if (c === '\n') {
      console.log(this.buffer);
      this.buffer = '';
    } else {
      this.buffer += c;
    }
  }
  flush() {
    if (this.buffer.length > 0) {
      console.log(this.buffer);
      this.buffer = '';
    }
  }
}
