// parser.ts
import { Token } from './tokenizer';
import { Instruction, LoopInstruction } from './type';

/**
 * 解析結果を木構造のASTに変換する
 * @param tokens 解析するTokenの配列
 * @param result 解析結果を格納する配列
 * @returns 解析結果の木構造のAST
 */
export function parse(
  tokens: Token[],
  result: Instruction[] = []
): Instruction[] {
  if (tokens.length === 0) {
    // 全てのTokenを解析し終えたら結果を返す
    return result;
  }

  // 先頭のTokenを取り出す
  const token = tokens.shift()!;

  if (token === '[') {
    // '['だったら新しい配列を用意し、再帰的に解析し、その結果を配列に格納する
    const loopInst: LoopInstruction = { instructions: parse(tokens, []) };
    result.push(loopInst);
    return parse(tokens, result);
  } else if (token === ']') {
    // ']'だったら結果を返す
    return result;
  } else {
    // '+' '-' '<' '>' '.' ','のいずれかだったら、そのTokenを配列に格納する
    result.push(token);
    return parse(tokens, result);
  }
}
