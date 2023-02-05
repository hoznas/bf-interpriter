import { evalCode } from './evaluator';
import { StringInput, StringOutput } from './IO';

function main() {
  //const code = '++++++++++[->++++++++++<]>---.+.+.+.';
  const code =
    '++++++++++[->+++++++<]>++.>++++++++++[->++++++++++<]>+.<+++[->++<]>+..+++.<<<++++[->-------<]>.<+++[->----<]>.>++[->++++<]>.<++[->----<]>.+++.<++[->---<]>.<++[->----<]>.<<+.';
  const inputStr = 'this is sample input.';

  const input = new StringInput(inputStr);
  const output = new StringOutput();
  evalCode(code, output, input);
}

main();
