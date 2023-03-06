# 言語処理系を自作しよう！（第１回　BF編）
プログラマの皆さん！
身の回りのソフトウェアを自分で作りたいと思ったことありますよね？

blogやtodoリスト、テキストエディタやブラウザなどを作ろうと挑戦したことは、１度や２度では無いですよね。
ええ、きっとあるはずです。プログラマというものはそういうものです。

この記事では簡単なプログラミング言語から始めて、ちょっとずつ難しい言語にステップアップしていきます。

## プログラミング言語を自作することに何のメリットが？？
プログラミング言語を自分で作ることで、プログラミング言語に対する深い理解が生まれます。
もちろん、プログラミング言語を自作するのは、それなりに大変な作業ですが、
その分、成し遂げた達成感はかなりのものです。
これからのプログラミング生活に大きなプラスをもたらします。
大丈夫です。簡単なものから始めて徐々に複雑な言語にステップアップしていきましょう。

## 今回のテーマ「BrainF*ck」です
BrainF*ckとは、簡単に書くと以下のような特徴があるプログラミング言語です。
言語処理系を初めて作るのに最適なプログラミング言語です。
（でも、名前がよろしく無いので、ここからはBFと表記しますね。）
- 命令が8個(8文字)しかなく、言語処理系が小さくなるように設計されています。
- 計算機理論の「チューリングマシン」を忠実に再現した計算モデルです。
- いわゆる「難解言語」の一つとされ、読みににくく、書きにくいです。実用性もありません。
- Hello, world!を出力するプログラムは以下のとおりです。（コードは英語版のwikipediaから拝借）
```BrainFuck
++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

### BFの詳しい説明
詳しい説明は、以下のサイトに譲ります。（文章量が多くなると私が大変なので、スミマセン！）
- https://ja.wikipedia.org/wiki/Brainfuck
- http://www.kmonos.net/alang/etc/brainfuck.php

## さっそくインタプリタを作ってみよう
まず最初にお断りしますが、このコーナーでは主にTypescriptを使って書きます。
理由は私がメインで使っていて馴染みがあるためです。
（Typescriptとvscodeが組み合わさると、とてつもなく生産性高くなりますよね！）
もちろん、Typescript固有の機能は避けて書こうと思いますので、よろしくお願いいたします。


## BFプログラムとJavascriptの対応表
BFは極度に書き方がシンプルなので、以下の表のようにTypescriptのコードに対応できます。
単純でわかりやすいですね！
|BFの命令|意味| Typescriptの対応するコード|
|-------|---|----------------|
|>|ポインタを左に移動する|pointer++;|
|<|ポインタを左に移動する|pointer--;|
|+|ポインタが指し示すメモリセルを1増やす|memory\[pointer\]++;|
|-|ポインタが指し示すメモリセルを1減らす|memory\[pointer\]--;|
|\[|ポインタが指し示すメモリセルが0でない間、対応する"\]"までの命令を繰り返す|while(memory\[pointer]!==0){|
|\]|上記のとおり|}|
|.|ポインタが指し示すメモリセルに対応する文字コードを出力する|process.stdout.write(String.fromCharCode(memory\[pointer\]));|
|,|ポインタが指し示すメモリセルに１文字入力する| typescriptでバイト単位で標準入力を受け取る方法は何が良いでしょう？|

実際に置き換えれば言語処理系として完成してしまうのですが、それでは技術的経験値を積めないのでちょっと丁寧に言語処理系を作ります。


# BNF
さて、皆さん、BNFという記法をご存知でしょうか？
以下のような、プログラミング言語などの"文法"を記述する言語です。
まずは見てみましょう。

```bnf
<Program> ::= <Instruction>*
<Instruction> ::= "+" | "-" | "<" | ">" | "." | "," | <LoopInstruction>
<LoopInstruction> ::= "[" <Instruction>* "]"
```

上記はこれから作るBFの言語処理系の文法を記述したものです。
意味は、以下のとおりです。
- プログラムは、命令(Instruction)の0回以上の繰り返しである。
- 命令は、">"、"<"、"+"、"-"、"."、","、とループ命令である。
- ループ命令は、"\["と"\]"で囲まれたinstructionの0回以上の繰り返しである。

どうでしょう？割とシンプルですよね。

前回と比べると"]"が命令ではなく、"\["と"\]"で一つの命令セットになっているところがポイントです。
また、LoopInstructionの中でまたInstructionがあるため、"[]"のネストもちゃんと表現出来そうです。

このBNFを元に言語処理系の作成を進めます。


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
BFのコードを文法的に意味のある最小の要素まで分解するとどうなるでしょうか？
簡単ですね！"+","-","<",">",".",",","\[","\]"です！

では、BFのプログラム文字列を受け取り、Tokenの配列を返す関数tokenize()を書いてみましょう。

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
次に行きましょう！

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
    // Other Instructions (+ - < > . ,)
    result.push(t);
    return parse(tokens, result);
  }
}
```

大まかに説明すると以下のようになります。(順番が前後しますがご容赦ください。)
- 命令が(+ - < > . ,)のときは配列(result)に格納する。
- "["があったら、新しい配列を用意して再帰的に構文を解析し、その結果を配列に格納する。
- "]"があったらresultを返す。
- 上記を再起的に繰り返し、最終的にtokensが空になったらresultを返して終了となります。

さて、以下のBFプログラムを試しに実行してみましょう！
```Typescript
const bfCode = "+++[->+++[->+[<-->]++<][.,]<]+++."//適当です
const tokens = tokenize(bfCode)
const node = parse(tokens)
console.log(node)
```

# evaluator(評価器)
次は評価器です。
parserが作成してくれたASTを評価していきます。

```Typescript
// Evaluator.ts
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


