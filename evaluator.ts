import { AbstractInput, AbstractOutput } from './IO';
import { parse } from './parser';
import { tokenize } from './tokenizer';
import { Program } from './type';

type Memory = { [key: number]: number };

export function evalCode(
  code: string,
  output?: AbstractOutput,
  input?: AbstractInput
): void {
  const tokens = tokenize(code);
  const program = parse(tokens);
  evalBf(program, 0, {}, output, input);
}

function evalBf(
  program: Program,
  ptr: number,
  mem: Memory,
  output?: AbstractOutput,
  input?: AbstractInput
) {
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
      if (output) {
        output.putCharCode(mem[ptr]);
      } else {
        console.log(String.fromCharCode(mem[ptr]));
      }
    } else if (inst === ',') {
      mem[ptr] = input?.getCharCode() || 0;
    } else {
      // inst instanceof LoopInstruction
      while (mem[ptr] !== 0) {
        evalBf(inst.exps, ptr, mem);
      }
    }
  }
  output?.flush();
}
