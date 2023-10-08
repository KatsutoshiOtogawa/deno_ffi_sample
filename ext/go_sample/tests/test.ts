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
const libPath = new URL(`../out/`, import.meta.url);

const name = "go_sample";

// u8で指定するなら文字列
// 文字列を返す場合はあらかじめ、配列の長さを指定する必要がある。
const Point = [
  "i64",
  "i64",
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
  "HelloWorld": {
    name: "HelloWorld",
    parameters: [],
    result: "void",

  },
  "Println_GO": {
    name: "Println_GO",
    parameters: ["buffer", "i64"],
    result: "void",
  },
  "Println_C": {
    name: "Println_C",
    parameters: ["buffer"],
    result: "void",
  },
  "Add_GO": {
    name: "Add_GO",
    parameters: ["usize", "usize"],
    result: "usize",
  },
  "Add_C": {
    name: "Add_C",
    parameters: ["usize", "usize"],
    result: "usize",
  },
  "Return_Buffer": {
    name: "Return_Buffer",
    parameters: [],
    result: "pointer"
  },

  "Free_Memory": {
    name: "Free_Memory",
    parameters: ["pointer"],
    result: "void"
  },
  "Point": {
    name: "Point",
    parameters: [],
    result: "pointer"
  },
  "PrintPoint": {
    name: "PrintPoint",
    parameters: ["pointer"],
    result: "pointer"
  }
});

const { 
  HelloWorld, 
  Println_GO,
  Println_C,
  Add_C,
  Add_GO,
  Return_Buffer,
  Free_Memory,
  Point,
  PrintPoint,
} = library.symbols;

// HelloWorld
HelloWorld();

// 文字列はUint8Arrayで渡す。
const mes_GO = new TextEncoder().encode("Hello Println_GO");
Println_GO(mes_GO, mes_GO.length);

// 文字列はUint8Arrayで渡す。
const mes_C = new TextEncoder().encode("Hello Println_C");

Println_C(mes_C);

const added_C = Add_C(64, 64);

console.log(added_C);

const added_GO = Add_GO(32, 64);

console.log(added_GO);

const ptr = Return_Buffer();

// @ts-ignore
const ptrtview = new Deno.UnsafePointerView(ptr)

const ptrbuf = ptrtview.getBigInt64();

console.log(ptrbuf);

// free memory
Free_Memory(ptr);

const pointptr = Point();

PrintPoint(pointptr);

Free_Memory(pointptr);
// // 最後はcloseする。
// closeで呼び出されたpointは全て破壊される。
library.close();
