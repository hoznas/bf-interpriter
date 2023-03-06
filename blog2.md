# ちょっと丁寧に言語処理系を作ろう！（第２回　本格BF編）
今回もBFをテーマに、ちょっと丁寧めに言語処理系(インタプリタ)を作っていきます。
なお、私は言語処理系を趣味で作っている人間なので、正しい用語の使い方をしていないかもしれません。気になるところは各自で適切なソースを使って確認をお願いします。

# BNF
さて、皆さん、BNFという記法をご存知でしょうか？
以下のような、プログラミング言語などの文法を記述する言語です。
まずは見てみましょう。

```bnf
<Program> ::= <Instruction>*
<Instruction> ::= "+" | "-" | "<" | ">" | "." | "," | <LoopInstruction>
<LoopInstruction> ::= "[" <Instruction>* "]"
```

上記は私が考えたBFの文法を記述したものです。
意味は、以下のとおりです。
- プログラムは、命令(Instruction)の0回以上の繰り返しである。
- 命令は、">"、"<"、"+"、"-"、"."、","、とループ命令である。
- ループ命令は、"\["と"\]"で囲まれたinstructionの0回以上の繰り返しである。

どうでしょう？割とシンプルですよね。

前回と比べると"]"が命令ではなく、"\["と"\]"で一つの命令セットになっているところがポイントです。LoopInstructionの中でまたInstructionがあるため、"[]"のネストもちゃんと表現出来そうですね。

# シンプルなインタプリタの構造
さて、一般的なインタプリタの構造は以下の３つで構成されます。
今回のインタプリタも同じ構成で作成します。
| 構成 | 概要 |
|-----|------|
|tokenizer(字句解析器)|ソースコードを受け取り、プログラミング言語の文法を構成する最小の要素（トークン）に分解する。|
|parser(構文解析器)|tokenizerから受け取ったtokenの配列を、文法的に意味のある木構造のデータ構造（AST:抽象構文木）を構築する|
|evaluator(評価器)|parserが作った抽象構文木を受け取り、評価(実行)する。|

ここはとりあえず「そういうものがあるんだな」という感じで進めていきます。

# Tokenizer(字句解析器)
さて、BNFに基づいてTokenizerをみて、文法上の最小の要素は"+","-","<",">",".",",","\[","\]"となります。
BFなんだから、当然そうなりますよね。

では、BFのプログラム文字列を受け取り、Tokenの配列を返す関数tokenize()を書いてみます。

```Typescript
// tokenizer.ts
//　トークンの型定義
export type Token = '+' | '-' | '<' | '>' | '.' | ',' | '[' | ']';
//　BFコードを受け取り、Tokenの配列を返す関数
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  for (let i = 0; i < code.length; i++) {
    // Tokenに含まれるとき、resultに追加する
    if (['+', '-', '<', '>', '.', ',', '[', ']'].includes(code.charAt(i))) {
      tokens.push(code.charAt(i) as Token);
    } else {
      // Tokenに含まれない文字はスキップする
    }
  }
  return result;
}
```

特に説明はいりませんね。

トークンとなる8文字以外は無視されるので、プログラムにコメントを書くこともできるようになっています。

# ASTの型定義
さて、Parserの前にやらなければいけないことがあります。
木構造のASTのデータ構造を定義しましょう。

以下のようになります。
```Typescript
// type.ts
export type Program = Instruction[];

export type Instruction = '+' | '-' | '<' | '>' | '.' | ',' | LoopInstruction;

export type LoopInstruction = {
  instructions: Instruction[];
};
```

上記の BNFそのままですね！
次行きましょう！

# Parser(構文解析器)
さて、次はparserの作成です。
先ほどのデータ構造をもとに木構造のASTを作成します。

```Typescript
// parser.ts
import { Token } from './tokenizer';
import { Instruction } from './type';

export function parse( tokens: Token[], result: Instruction[]): Instruction[] {
  if (tokens.length === 0) {
    return result;
  }

  const t = tokens.shift()!;
  if (t === '[') {
    const loopInst:LoopInstruction = { instructions: parse(tokens, []) }
    result.push(loopInst);
    return parse(tokens, result);
  } else if (t === ']') {
    return result;
  } else {
    // Other Instructions + - < > . ,
    result.push(t);
    return parse(tokens, result);
  }
}
```
再帰関数は大丈夫でしょうか？

大まかに説明すると以下のようになります。(順番が前後しますがご容赦ください。)
- 命令が{+ - < > . ,}のときは配列(result)に格納する。
- "["があったら、新しい配列を用意して再帰的に構文を解析し、その結果を配列に格納する。
- "]"があったらresultを返す。
- 上記を繰り返し、最終的にtokensが空になったらresultを返して終了となります。

言語処理系でなくても、木構造のデータを処理するとき、再帰関数でプログラムを書くことになるので、ここで覚えましょう！
もし自信がないときは以下のようにプログラムを実行してきちんと適切なデータ構造になっているか確認してみて下さい。
```Typescript
const bfCode = "+++[->+++[->+++<][.,]<]+++."//適当です
const tokens = tokenize(bfCode)
const node = parse(tokens)
console.log(node)
```

# evaluator(評価器)
さて、次は評価器です。
parserが作成してくれたASTを評価していきます。

```Typescript
import { parse } from './parser';
import { tokenize } from './tokenizer';
import { Program } from './type';

export function evaluate(program: Program, pointer: number=0, memory: Number[]=[]) {
  for (const inst of program) {
    // pointerの指すメモリが未定義のときは0を入れておく。
    if (memory[pointer] === undefined) memory[pointer] = 0

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
      /* memory[pointer] = getCharacter() */
    } else {
      // if (inst instanceof LoopInstruction)
      while (memory[pointer] !== 0) {
        evalBf(inst.instructions, pointer, memory);
      }
    }
  }
}
```
もう簡単ですね。
- {+ - < > , .}のときは、そのとおり実行する。
- ループ命令の時は、メモリの値が0でない間、再帰して実行します。
- プログラムの最後に到達したら終了です。

では、実行してみましょう
```Typescript
const bfCode = "++++++++++[->+++++++<]>++.>++++++++++[->++++++++++<]>+.<+++[->++<]>+..+++.<<<++++[->-------<]>.<+++[->----<]>.>++[->++++<]>.<++[->----<]>.+++.<++[->---<]>.<++[->----<]>.<<+."
const tokens = tokenize(bfCode)
const node = parse(tokens)
evaluate(node)
```

```
Hello, world.
```

どうでしょうか？
ちょっとめんどくさいですけど、ちゃんとプログラムが実行できたかと思います。



