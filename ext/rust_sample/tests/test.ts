/// <reference lib="deno.unstable" />

import { download, FetchOptions } from 'x/plug/mod.ts';
import { X_OK, R_OK } from "./AccessType.ts";
import { removeCache } from './init.ts';

await removeCache();

// バイナリダンプを取得する関数
function getBinaryDump(uint8Array: Uint8Array) {
  let binaryDump = "";
  for (let i = 0; i < uint8Array.length; i++) {
      // 1バイトを16進数文字列に変換し、2桁表示にする
      const hexValue = uint8Array[i].toString(16).padStart(2, "0");
      binaryDump += hexValue + " ";
  }
  return binaryDump.trim(); // 末尾のスペースを削除
}

const build_mode = "debug";
// debug -> releaseになる。
// const libPath = new URL('../target/x86_64-unknown-linux-gnu/debug/', import.meta.url);
const libPath = new URL(`../target/x86_64-unknown-linux-gnu/${build_mode}/`, import.meta.url);

const name = "ssh2";

// u8で指定するなら文字列
// 文字列を返す場合はあらかじめ、配列の長さを指定する必要がある。
const CommandOutput = [
  "i32",
  "pointer",
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
  },

});

const { connect, send_command, print_pointer, drop_string_ffi} = library.symbols;

const username = new TextEncoder().encode("miyuu");
const password = new TextEncoder().encode("mecchakawaii!");
// portまで含めたアドレス。
console.log(
  connect(
    username,
    username.length,
    password,
    password.length,
    192,
    168,
    0,
    210,
    22
  )
);

// touch hello.world
const command = new TextEncoder().encode("echo helloworld");


const commandOutput = send_command(
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

// console.log("commandOutput:", commandOutput.length);

// 32 / 8 = 4 進める
const status = new Int32Array(commandOutput.buffer, 0, 1)[0];

const stdoutptrnum = new BigInt64Array(commandOutput.buffer, 8, 1)[0];

// 構造体のメンバーのポインタ
const stdoutptr = Deno.UnsafePointer.create(stdoutptrnum);

// @ts-ignore
const stdoutview = new Deno.UnsafePointerView(stdoutptr)

// const view = new Deno.UnsafePointerView(stdoutptr);

const stdout = stdoutview.getCString();

const stderrptrnum = new BigInt64Array(commandOutput.buffer, 16, 1)[0];

// ReferenceError:
const stderrptr = Deno.UnsafePointer.create(stderrptrnum);

 // @ts-ignore
const stderrview = new Deno.UnsafePointerView(stderrptr)

const stderr = stderrview.getCString();

// ポインタ破壊。
drop_string_ffi(stdoutptr);
drop_string_ffi(stderrptr);

console.log(stdout, stderr, status);
// 
// drop_string_ffi()

// アラインメントにより、ずれる。
// 64bit processerなのでBigUint64
// const stdout_length = Number(new BigUint64Array(commandOutput.buffer, 8, 1)[0]);
// const stderr_length = Number(new BigUint64Array(commandOutput.buffer, 16, 1)[0]);
// const stdoutArray = new Uint8Array(commandOutput.buffer, 24, stdout_length);
// 64bit は64/8 = 8バイトのポインター

// buffer、pointerはbigUint64Arrayで受ける。
// const stdoutArray = new BigUint64Array(commandOutput.buffer, 24, 1);
// const stdoutArray = new Uint8Array(commandOutput.buffer, 24, 8);

// console.log("stdout binary dump",getBinaryDump(stdoutArray));

// // @ts-ignore
// const stdoutPointer = Deno.UnsafePointer.of(stdoutArray);

// // @ts-ignore
// const stdoutPointerView = new Deno.UnsafePointerView(stdoutPointer)


// // print_pointer(stdoutPointer, stdout_length);

// // stdoutPointerView.getArrayBuffer(stdout_length);

// // @ts-ignore
// // const stdout = new Deno.UnsafePointerView(Deno.UnsafePointer.create(stdoutArray[0])).getCString();

// const stdout = stdoutPointerView.getCString();
// console.log(stdout)

// console.log(new TextDecoder().decode(stdoutPointerView.getArrayBuffer(stdout_length)));
// console.log(stdoutPointerView.getCString());

// // const string = new Uint8Array([
// //   ...new TextEncoder().encode("Hello from pointer!"),
// //   0,
// // ]);
// // const stringPtr = Deno.UnsafePointer.of(string);
// // // @ts-ignore
// // const stringPtrview = new Deno.UnsafePointerView(stringPtr);
// // console.log(stringPtrview.getCString());
// // console.log(stringPtrview.getCString(11));

// // const stdout = new TextDecoder().decode(stdoutPointerView.getCString());

// // const stdout = new TextDecoder().decode(stdoutArray);



// // 文字列はアドレス番地で帰る。
// // const stderrArray = new Uint8Array(commandOutput.buffer, 24 + stdout_length * 8, stderr_length);
// const stderrArray = new Uint8Array(commandOutput.buffer, 32, 8);
// const stderr = new TextDecoder().decode(stderrArray);

// console.log("stderr binary dump",getBinaryDump(stderrArray));

// console.log(status, stdout, stderr);

// // 最後はcloseする。
library.close();

// // console.log(connect(username, password, addr));

