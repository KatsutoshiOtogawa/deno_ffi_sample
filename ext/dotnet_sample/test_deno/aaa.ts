
import {load, library} from './load_library.ts';

const {
    Multiply,

    ReturnPointer,
    Free
}  = load();


const mul = Multiply(3, 5);


console.log(mul);

const buf = ReturnPointer()

// @ts-ignore
const ptrtview = new Deno.UnsafePointerView(buf)

const ptrbuf = ptrtview.getBigInt64();

console.log(ptrbuf);

Free(buf);

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

