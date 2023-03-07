// tokenizer.ts
// トークンの型定義
export type Token = '+' | '-' | '<' | '>' | '.' | ',' | '[' | ']';

// BFコードを受け取り、Tokenの配列を返す関数
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];

  for (let i = 0; i < code.length; i++) {
    // Tokenに含まれる場合、tokensに追加する
    if (['+', '-', '<', '>', '.', ',', '[', ']'].includes(code.charAt(i))) {
      tokens.push(code.charAt(i) as Token);
    }
    // Tokenに含まれない場合はスキップする
  }

  return tokens;
}
