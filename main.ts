import { Evaluator } from './evaluator';
import { StringInput, StringOutput } from './IO';

function main() {
  const code =
    '++++++++++[->+++++++<]>++.>++++++++++[->++++++++++<]>+.<+++[->++<]>+..+++.<<<++++[->-------<]>.<+++[->----<]>.>++[->++++<]>.<++[->----<]>.+++.<++[->---<]>.<++[->----<]>.<<+.';
  //'+[,.]';
  const inputStr = 'this is sample input.';

  const input = new StringInput(inputStr);
  const output = new StringOutput();
  const evaluator = new Evaluator(input, output);
  evaluator.evalCode(code);
}

main();
