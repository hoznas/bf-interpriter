# 言語処理系を自作しよう！（第１回　BF編）
プログラマの皆さん！
身の回りのソフトウェアを自分で作りたいと思ったことありますよね？

BlogやTodoリスト、テキストエディタやブラウザなどを作ろうと挑戦したことは、１度や２度ではないはずです。
そう、きっとあるはずです。プログラマというものはそういうものです。

この記事では簡単なプログラミング言語から始めて、少しずつ難しい言語にステップアップしていきます。

## プログラミング言語を自作することのメリットは何でしょうか？
プログラミング言語を自分で作ることで、プログラミング言語に対する深い理解が生まれます。
もちろん、プログラミング言語を自作するのは、それなりに大変な作業ですが、その分、達成感が大きくなります。
これからのプログラミング生活に大きなプラスをもたらします。

大丈夫です。簡単なものから始めて徐々に複雑な言語にステップアップしていきましょう。

## 今回のテーマは「BrainF*ck」です
BrainF*ckとは、簡単に書くと以下のような特徴があるプログラミング言語です。

非常にシンプルな言語なので言語処理系を初めて作るのに最適なプログラミング言語です。
（でも、名前がよろしくないので、ここからはBFと表記しますね。）

- 命令が8個(8文字)しかなく、言語処理系が小さくなるように設計されています。
- 計算機理論の「チューリングマシン」を忠実に再現した計算モデルです。
- いわゆる「難解言語」の一つとされ、読みにくく、書きにくいです。実用性もありません。

Hello, world!を出力するプログラムは以下のとおりです。（コードは英語版のWikipediaから拝借）
```BrainFuck
++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

### BFの詳しい説明
BFの詳細については、以下のサイトを参照してください。文章が長くなると私に負担がかかるため、申し訳ありません。
- https://ja.wikipedia.org/wiki/Brainfuck
- http://www.kmonos.net/alang/etc/brainfuck.php

## インタプリタを作ろう
インタプリタのソースコードはTypescriptで表記します。
理由は、私がメインで使用していて馴染みがあるためです。
もちろん、Typescript固有の機能は使用しません。

## BFプログラムとTypescriptの対応表
BFは、命令が非常に単純であるため、以下の表のようにTypescriptのコードに対応することができます。
|BFの命令|意味| Typescriptの対応するコード|
|-------|---|----------------|
|>|ポインタを右に移動する|pointer++;|
|<|ポインタを左に移動する|pointer--;|
|+|ポインタが指し示すメモリセルの値を1増やす|memory\[pointer\]++;|
|-|ポインタが指し示すメモリセルの値を1減らす|memory\[pointer\]--;|
|\[|ポインタが指し示すメモリセルの値が0でない間、対応する"]"までの命令を繰り返す|while(memory\[pointer\]!==0){|
|\]|上記のとおり|}|
|.|ポインタが指し示すメモリセルに対応する文字コードを出力する|process.stdout.write(String.fromCharCode(memory\[pointer\]));|
|,|１文字読み取ってそのASCIIコードをメモリセルに格納する|memory\[pointer\] = input.read();/* 実装は後で紹介します */|

実際に置き換えれば言語処理系として完成してしまうのですが、それでは技術的経験値を積めないのでちょっと丁寧に言語処理系を作ります。


# BNF
さて、皆さん、BNFという記法をご存知でしょうか？以下はプログラミング言語などの"文法"を記述するための言語です。まずは、以下の文法を見てみましょう。

```bnf
<Program> ::= <Instruction>*
<Instruction> ::= "+" | "-" | "<" | ">" | "." | "," | <LoopInstruction>
<LoopInstruction> ::= "[" <Instruction>* "]"
```

上記は、作成予定のBFの言語処理系の文法を記述したものです。
意味は以下のとおりです。
- プログラムは、0回以上の命令(Instruction)の繰り返しである。
- 命令は、">"、"<"、"+"、"-"、"."、","、およびループ命令である。
- ループ命令は、"["と"]"で囲まれたinstructionの0回以上の繰り返しである。

どうでしょう？かなりシンプルですよね。

ここでのポイントは、以下です。
- "["と"]"がそれぞれ単独の命令ではなく、一つの命令セットとして扱われています。つまり、"["から"]"までの間にある命令がループ命令として扱われ、繰り返し実行されることになります。
- ループ命令はInstructionを入れ子にすることができ、複雑なプログラムを表現できるようになります。

# シンプルなインタプリタの構造
さて、一般的なインタプリタの構造は以下の３つの処理器で構成されます。
今回のインタプリタも同じ構成で作成します。
| 構成 | 概要 |
|-----|------|
|tokenizer(字句解析器)|ソースコードを受け取り、プログラミング言語の文法を構成する最小の要素（トークン）に分解する。|
|parser(構文解析器)|tokenizerから受け取ったtokenの配列を、文法的に意味のある木構造のデータ構造（AST:抽象構文木）を構築する|
|evaluator(評価器)|parserが作った抽象構文木を受け取り、評価(実行)する。|

ここはとりあえず「そういうものがあるんだな」という感じで進めていきます。

# Tokenizer(字句解析器)
BFのコードを文法的に意味のある最小の要素まで分解すると、どうなるでしょうか？
簡単ですね！"+", "-", "<", ">", ".", ",", "[", "]"です！

それでは、BFのプログラム文字列を受け取り、Tokenの配列を返す関数tokenize()を書いてみましょう。

```Typescript
// tokenizer.ts
// トークンの型定義
export type Token = '+' | '-' | '<' | '>' | '.' | ',' | '[' | ']';

/**
  BFコードを受け取り、Tokenの配列を返す関数
  @param {string} code BFコード
  @returns {Token[]} Tokenの配列
*/
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
```

特に説明は必要ありませんね。

トークンとなる8文字以外は無視されるため、プログラムにコメントを書くことができるようになります。


# ASTの型定義
AST（抽象構文木）とは、コードの構文を木構造で表現したものです。
BFの場合、以下のように定義できます。
```Typescript
// type.ts
export type Program = Instruction[];

export type Instruction = '+' | '-' | '<' | '>' | '.' | ',' | LoopInstruction;

export type LoopInstruction = {
  instructions: Instruction[];
};
```

これにより、コードを解析して木構造に変換することができます。
BNFの記述と違う部分は、"["と"]"が消えて、LoopInstructionに集約されたことです。

ちなみにASTの利点は、プログラムを解析することが容易になることです。
インタプリタはこの木構造を辿って評価を行いますし、また、最適化や言語間の変換にも使われます。

# Parser(構文解析器)
さて、次はparserの作成です。
先ほどのデータ構造をもとに木構造のASTを作成します。

```Typescript
// parser.ts
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
```

大まかに説明すると以下のようになります。(順番が前後しますがご容赦ください。)
- 命令が(+ - < > . ,)のときは配列(result)に格納する。
- "["があったら、新しい配列を用意して再帰的に構文を解析し、その結果を配列に格納する。
- "]"があったらresultを返す。
- 上記を再起的に繰り返し、最終的にtokensが空になったらresultを返して終了となります。

さて、以下のBFプログラムを試しに実行して、確認してみましょう！
```Typescript
// サンプルプログラム
const bfCode = "+++[->+++[->+[<-->]++<][.,]<]+++."  //適当です
const tokens = tokenize(bfCode)
const ast = parse(tokens)
console.log(ast)  // BFプログラムに対応するASTの出力
```

# evaluator(評価器)
次は評価器です。
parserが作成してくれたASTを評価していきます。

```Typescript
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
```
簡単に説明すると以下の通りです。
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

どうでしょうか？ちょっとめんどくさいですけど、ちゃんとプログラムが実行できたかと思います。
今回作成した手順で言語処理系を書いていけば多少複雑な言語に対しても、それなりにスムーズに作成できます。

このあとはBFのプログラミングを楽しむのも良し、新たな命令や最適化機構を取り入れるのも良し、インタプリタからコンパイラに改造するのも良し、スマホアプリに移植するのも良しです。

これはあなたの言語処理系です。自由にプログラミングを楽しんでください。


