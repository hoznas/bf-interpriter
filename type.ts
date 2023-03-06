export type Program = Instruction[];

export type Instruction = '+' | '-' | '<' | '>' | '.' | ',' | LoopInstruction;

export type LoopInstruction = {
  instructions: Instruction[];
};
