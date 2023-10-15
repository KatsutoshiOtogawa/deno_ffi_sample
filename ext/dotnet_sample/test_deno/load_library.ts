import { _load, CallSymbol } from './_load_library.ts';

// ここclassの方が良いかも。
// clientの数が必要ならclassがいる。
let library: Deno.DynamicLibrary<typeof CallSymbol> | null = null;

function load() {

  // libraryが読み込まれていなかったらロード
  if (library === null) {
    library = _load();
  }

  const { 
    Multiply,
    ReturnPointer,
    ReturnPointer2,
    PrintBuffer,
    // InitConfig,
    // Connect,
    // ClientClose,
    // NewSession,
    // SessionRun,
    // SessionClose,
    Free,
    FreeHGlobal,
  } = library.symbols;

  return {
    Multiply,
    ReturnPointer,
    ReturnPointer2,
    PrintBuffer,
    // InitConfig,
    // Connect,
    // ClientClose,
    // NewSession,
    // SessionRun,
    // SessionClose,
    Free,
    FreeHGlobal,
  };
}

export {
  load,
  library
}