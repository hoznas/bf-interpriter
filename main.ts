import { evaluate } from './evaluator';
import { parse } from './parser';
import { tokenize } from './tokenizer';

const code =
  '++++++++++[->+++++++<]>++.>++++++++++[->++++++++++<]>+.<+++[->++<]>+..+++.<<<++++[->-------<]>.<+++[->----<]>.>++[->++++<]>.<++[->----<]>.+++.<++[->---<]>.<++[->----<]>.<<+.';
//'+[,.]';

const tokens = tokenize(code);
const ast = parse(tokens);
evaluate(ast);
