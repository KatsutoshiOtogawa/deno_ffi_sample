import { download, FetchOptions } from 'x/plug/mod.ts';
import { removeCache } from './init.ts';

import { BuildMode } from './BuildMode.ts';

function loadDynamicLib() {
  // 今だけ、後で、外部のurlにする。
  const libPath = new URL(`ext/ssh2/target/x86_64-unknown-linux-gnu/debug/`, import.meta.url);
  _loadDynamicLib(libPath);
}

async function _loadDynamicLib(libPath: URL) {

  await removeCache();

  const name = "rust_sample";

  const CommandOutput = [
    // statusコード
    "i32",
    // 標準出力から取得
    "pointer",
    // 標準エラーから取得
    "pointer"
  ] as const;

  // urlはローカルパスでも良い。
  const url = {
  // linux: "../target/x86_64-unknown-linux-gnu/debug/",
  linux: libPath.pathname,
  //   darwin: {
  //     aarch64: `https://example.com/some/path/libexample.aarch64.dylib`,
  //     x86_64: `https://example.com/some/path/libexample.x86_64.dylib`,
  //   },
  //   windows: `https://example.com/some/path/example.dll`,
  //   linux: `https://example.com/some/path/libexample.so`,
  // },
  }

  const options: FetchOptions = {
  // libwhich.soと保管される
  name,
  url,
  
  // url: {
  };

  const downloaded = await download(options);

  const library = Deno.dlopen(downloaded, {
  "print_pointer": { 
    name: "print_buffer",
    parameters: [
    "pointer",
    "usize"
    ], 
    result: "void" 
  },
  drop_string_ffi: {
    parameters: ["pointer"],
    result: "void",
  },
  "connect": {
    name: "connect",
    parameters: [
    // username
    "buffer", 
    // username_len
    "u32",
    // password
    "buffer",
    // password_len
    "u32",
    // addr_octet
    "u8",
    // addr_octet2
    "u8",
    // addr_octet3
    "u8",
    // addr_octet4
    "u8",
    // port
    "u16"
    ],
    result: "bool"
  },
  "send_command": {
    name: "send_command",
    parameters: [
    // username
    "buffer", 
    // username_len
    "u32",
    // password
    "buffer",
    // password_len
    "u32",
    // addr_octet
    "u8",
    // addr_octet2
    "u8",
    // addr_octet3
    "u8",
    // addr_octet4
    "u8",
    // port
    "u16",
    // command
    "buffer",
    // command_len
    "u32"
    ],
    result: { struct: CommandOutput},
  }
  });

  return library;
}

/** main function */
/** 手動チェック用 */
if (import.meta.main) {

  const libPath = new URL(`ext/ssh2/target/x86_64-unknown-linux-gnu/debug/`, import.meta.url);
  const dylib = await _loadDynamicLib(libPath);

  let stdoutptr: Deno.PointerValue<unknown> = null;
  let stderrptr: Deno.PointerValue<unknown> = null;
  try {

    const username = new TextEncoder().encode("miyuu");
    const password = new TextEncoder().encode("mecchakawaii!");
    const command = new TextEncoder().encode("echo I love You! >> love_whisper.txt && echo I love you more!");

    // コマンド実行。
    const commandOutput = dylib.symbols.send_command(
      username,
      username.length,
      password,
      password.length,
      192,
      168,
      0,
      210,
      22,
      command,
      command.length
    );

    // rustで宣言した構造体の順番でデコードする必要があるが、
    // 32 / 8 = 4 進める
    const status = new Int32Array(commandOutput.buffer, 0, 1)[0];

    // Cで作った文字列へのアドレス(数字でしかない。)
    const stdoutptrnum = new BigInt64Array(commandOutput.buffer, 8, 1)[0];

    // 
    // 構造体の標準出力のメンバーのポインタ
    stdoutptr = Deno.UnsafePointer.create(stdoutptrnum);

    // @ts-ignore
    const stdoutview = new Deno.UnsafePointerView(stdoutptr)

    const stdout = stdoutview.getCString();

    const stderrptrnum = new BigInt64Array(commandOutput.buffer, 16, 1)[0];

    stderrptr = Deno.UnsafePointer.create(stderrptrnum);

    // @ts-ignore
    const stderrview = new Deno.UnsafePointerView(stderrptr)

    const stderr = stderrview.getCString();

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    console.log(`status: ${status}`);
  } finally {
    // ポインタ破壊。
    if (stdoutptr) {
      dylib.symbols.drop_string_ffi(stdoutptr);
    }
    if (stderrptr) {
      dylib.symbols.drop_string_ffi(stderrptr);
    }

    dylib.close();
  }
}
