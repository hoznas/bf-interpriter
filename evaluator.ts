import fs from 'fs';
import { Program } from './type';

/**
 * BFのプログラムを評価する。
 * @param program 評価対象のBFプログラムを表すAST
 * @param pointer 現在指しているメモリの位置
 * @param memory メモリの値を格納した配列
 * @param input 標準入力を読み込む。必要になるまで初期化されない
 */
export async function evaluate(
  program: Program,
  pointer: number = 0,
  memory: number[] = [],
  input: InputStream | undefined = undefined
) {
  for (const inst of program) {
    // pointerの指すメモリが未定義のときは0を入れておく。
    if (memory[pointer] === undefined) memory[pointer] = 0;
    // 命令を評価する
    if (inst === '+') {
      memory[pointer] += 1;
    } else if (inst === '-') {
      memory[pointer] -= 1;
    } else if (inst === '<') {
      pointer -= 1;
    } else if (inst === '>') {
      pointer += 1;
    } else if (inst === '.') {
      const charCode = memory[pointer];
      process.stdout.write(String.fromCharCode(charCode));
    } else if (inst === ',') {
      if (!input) input = new InputStream();
      memory[pointer] = input.read();
    } else {
      // ループ命令の場合、メモリの値が0でない間、ブロックの評価を繰り返す
      while (memory[pointer] !== 0) {
        evaluate(inst.instructions, pointer, memory, input);
      }
    }
  }
}
export class InputStream {
  private i = 0;
  constructor(private inputString = fs.readFileSync('/dev/stdin').toString()) {}
  read() {
    return this.i < this.inputString.length
      ? this.inputString.charCodeAt(this.i++)
      : 0;
  }
}
