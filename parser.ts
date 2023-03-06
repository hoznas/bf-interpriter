import { Token } from './tokenizer';
import { Instruction } from './type';

export function parse(
  tokens: Token[],
  result: Instruction[] = []
): Instruction[] {
  if (tokens.length === 0) {
    return result;
  }

  const t = tokens.shift()!;
  if (t === '[') {
    // LoopInstruction
    result.push({ instructions: parse(tokens) });
    return parse(tokens, result);
  } else if (t === ']') {
    return result;
  } else {
    // Other Instructions + - < > . ,
    result.push(t);
    return parse(tokens, result);
  }
}
