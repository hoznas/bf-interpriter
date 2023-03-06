//import { AbstractInput, AbstractOutput } from './IO';
import { AbstractInput, AbstractOutput } from './IO';
import { parse } from './parser';
import { tokenize } from './tokenizer';
import { Program } from './type';

type Memory = { [key: number]: number };

export class Evaluator {
  constructor(private input: AbstractInput, private output: AbstractOutput) {}

  evalCode(code: string): void {
    const tokens = tokenize(code);
    const program = parse(tokens);
    this.evalBf(program, 0, {});
  }

  evalBf(program: Program, ptr: number, mem: Memory) {
    for (const inst of program) {
      if (mem[ptr] === undefined) {
        mem[ptr] = 0;
      }

      if (inst === '+') {
        mem[ptr] += 1;
      } else if (inst === '-') {
        mem[ptr] -= 1;
      } else if (inst === '<') {
        ptr -= 1;
      } else if (inst === '>') {
        ptr += 1;
      } else if (inst === '.') {
        const charCode = mem[ptr];
        this.output.putCharCode(charCode);
      } else if (inst === ',') {
        mem[ptr] = this.input.getCharCode();
      } else {
        // if (inst instanceof LoopInstruction)
        while (mem[ptr] !== 0) {
          this.evalBf(inst.instructions, ptr, mem);
        }
      }
    }
  }
}
