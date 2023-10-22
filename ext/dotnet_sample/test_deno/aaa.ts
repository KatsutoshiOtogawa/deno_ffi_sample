
import {load, library} from './load_library.ts';

const {
    Multiply,

    PrintBuffer,
    ReturnPointer,
    ReturnPointer2,
    ReturnPointer3,
    PointerUse2,
    PointerUse3,
    Free,
    FreeHGlobal,
}  = load();


const mul = Multiply(3, 5);


console.log(mul);

const buf = ReturnPointer()

// @ts-ignore
const ptrtview = new Deno.UnsafePointerView(buf)

const ptrbuf = ptrtview.getBigInt64();

console.log(ptrbuf);

Free(buf);

const buf2 = ReturnPointer2();

// @ts-ignore
const ptrtview2 = new Deno.UnsafePointerView(buf2)

const ptrbuf2 = ptrtview2.getBigInt64();

console.log(ptrbuf2);

FreeHGlobal(buf2);

// 文字列はUint8Arrayで渡す。
const mes_GO = new TextEncoder().encode("Hello Println_dotnet");
PrintBuffer(mes_GO, mes_GO.length);


const ptr3 = ReturnPointer3();

PointerUse3(ptr3);

FreeHGlobal(ptr3);

// const CallSymbol = {
//     "Multiply": {
//         name: "Multiply",
//         parameters: [
//         "i64",
//         "i64",
//         ],
//         result: "i64"
//     },
// }
// const libname = './miyuu_ssh_core_windows/bin/Release/net7.0/win-x64/publish/miyuu_ssh_core_windows.dll';
// const library = Deno.dlopen(libname, CallSymbol);

// const { Multiply } = library.symbols

// const aaa = Multiply(3, 5);

// console.log(aaa);

library.close();

