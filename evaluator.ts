import * as readline from 'readline';
import { Program } from './type';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

/**
 * 標準入力から1byte読み取り、その数値をPromiseで返す。
 * @returns {Promise<number>} 読み取った数値
 */
async function readByte(): Promise<number> {
  return new Promise<number>((resolve) => {
    rl.once('line', (line: string) => {
      const charCode = line.charCodeAt(0);
      resolve(charCode);
    });
  });
}

/**
 * BFのプログラムを評価する。
 * @param program 評価対象のBFプログラムを表すAST
 * @param pointer 現在指しているメモリの位置
 * @param memory メモリの値を格納した配列
 */
export async function evaluate(
  program: Program,
  pointer: number = 0,
  memory: number[] = []
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
      /* 入力関数の実装は見送ります。各自で作ってみて下さい。 */
      memory[pointer] = await readByte();
    } else {
      // ループ命令の場合、メモリの値が0でない間、ブロックの評価を繰り返す
      while (memory[pointer] !== 0) {
        evaluate(inst.instructions, pointer, memory);
      }
    }
  }
}
