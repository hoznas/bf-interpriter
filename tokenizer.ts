export type Token = '+' | '-' | '<' | '>' | '.' | ',' | '[' | ']';

export function tokenize(code: string): Token[] {
  const result: Token[] = [];
  const bf_tokens = ['+', '-', '<', '>', '.', ',', '[', ']'];
  for (let i = 0; i < code.length; i++) {
    if (bf_tokens.includes(code.charAt(i))) {
      result.push(code.charAt(i) as Token);
    } else {
      // Tokenに含まれない文字はスキップする
    }
  }
  return result;
}
