/// <reference lib="deno.unstable" />

    // Multiply = library.Multiply
    // Multiply.argtypes = [c_int64, c_int64]
    // Multiply.restype = c_int64

    // Free = library.Free
    // Free.argtypes = [c_void_p]
    // Free.restype = None

    // FreeHGlobal = library.FreeHGlobal
    // FreeHGlobal.argtypes = [c_void_p]
    // FreeHGlobal.restype = None

    // ReturnBuffer = library.ReturnBuffer
    // ReturnBuffer.argtypes = None
    // # pythonのwchar_pはUTF-32エンコーディングなので注意。
    // ReturnBuffer.restype = c_char_p
const CallSymbol = {
  "Multiply": {
    name: "Multiply",
    parameters: [
    "i64",
    "i64",
    ],
    result: "i64"
  },
  "ReturnPointer": {
    name: "ReturnPointer",
    parameters: [

    ],
    result: "pointer"

  },
  "ReturnPointer2": {
    name: "ReturnPointer2",
    parameters: [

    ],
    result: "pointer"

  },
  "PrintBuffer": {
    name: "PrintBuffer",
    parameters: [
      // pointerとはbufferなので値を入れれる。
      // "pointer",
      "buffer",
      "i64"
    ],
    result: "void"

  },
  "Free": {
    name: "Free",
    parameters: [
      "pointer"
    ],
    result: "void"

  },
  "FreeHGlobal": {
    name: "FreeHGlobal",
    parameters: [
      "pointer"
    ],
    result: "void"

  },
  
    // "InitConfig": {
    //   name: "InitConfig",
    //   parameters: [
    //     "buffer",
    //     "i64",
    //     "buffer",
    //     "i64",
    //   ],
    //   result: "pointer"
    // },
    // "Connect": {
    //   name: "Connect",
    //   parameters: [
    //     // ClientConfig
    //     "pointer",
    //     // addr_octet
    //     "u8",
    //     // addr_octet2
    //     "u8",
    //     // addr_octet3
    //     "u8",
    //     // addr_octet4
    //     "u8",
    //     // port
    //     "u16"
    //   ],
    //   result: "pointer",
    // },
    // "ClientClose": {
    //   name: "ClientClose",
    //   parameters: [
    //     "pointer"
    //   ],
    //   result: "void"
    // },
    // "NewSession": {
    //   name: "NewSession",
    //   parameters: [
    //     "pointer"
    //   ],
    //   result: "pointer"
    // },
    // "SessionRun": {
    //   name: "SessionRun",
    //   parameters: [
    //     "pointer",
    //     // command
    //     "buffer",
    //     // command_len
    //     "i64",
    //   ],
    //   result: "void"
    // },
    // "SessionClose": {
    //   name: "SessionClose",
    //   parameters: [
    //     "pointer"
    //   ],
    //   result: "void"
    // },
    // "Free": {
    //   name: "Free",
    //   parameters: ["pointer"],
    //   result: "void"
    // },
} as const

function _load() {

  const os = Deno.build.os;

  let libname = "";

  // 
  if (os === 'linux') {
    libname = (new URL('../out/linux/dotnet_sample.so', import.meta.url)).href;
  } else if (os === 'darwin') {
    libname = (new URL('../out/mac/dotnet_sample.dylib', import.meta.url)).href;
  } else if (os === 'windows') {
    // C:/Users/katsutoshi/src/miyuu_ssh_core_windows/miyuu_ssh_core_windows/bin/Release/net7.0/win-x64/publish/miyuu_ssh_core_windows.dll
    // libname = "C:/Users/katsutoshi/src/miyuu_ssh_core_windows/miyuu_ssh_core_windows/bin/Release/net7.0/win-x64/publish/miyuu_ssh_core_windows.dll"
    // windowsの場合は右のようになるので、最初の一文字とバス。/C:/Users/
    libname = (new URL('../dotnet_sample/bin/Release/net7.0/win-x64/publish/dotnet_sample.dll', import.meta.url)).pathname.substring(1);
  } else {
    throw TypeError("Not supported os");
  }

  console.log(libname)
  const library = Deno.dlopen(libname, CallSymbol);

  return library;
}

export {
  type CallSymbol,
  _load
}
