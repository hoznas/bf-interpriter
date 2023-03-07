import { evaluate } from './evaluator';
import { parse } from './parser';
import { tokenize } from './tokenizer';

async function main() {
  const code =
    '++++++++++[->+++++++<]>++.>++++++++++[->++++++++++<]>+.<+++[->++<]>+..+++.<<<++++[->-------<]>.<+++[->----<]>.>++[->++++<]>.<++[->----<]>.+++.<++[->---<]>.<++[->----<]>.<<+.';
  //'+[,.]';

  const tokens = tokenize(code);
  const ast = parse(tokens);
  await evaluate(ast);
}

main();
