# How to build

Visual Studio installerから、
visual studio 2022のDesktop development with C++をデフォルト設定でインストールする。

https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/?tabs=net7%2Cwindows#prerequisites

https://learn.microsoft.com/ja-jp/dotnet/api/system.runtime.interopservices.unmanagedcallersonlyattribute?view=net-7.0

 dotnet publish -c Release -r win-x64
  dotnet publish -c Release -r linux-arm64


BitTableがサポートされているものしか使えない。
https://learn.microsoft.com/ja-jp/dotnet/framework/interop/blittable-and-non-blittable-types

1. Byte[]も使えない。がポインタは使えるのでポインタで受ける。

2. Booleanが無いので、注意。

https://github.com/dotnet/runtime/blob/main/src/coreclr/nativeaot/docs/compiling.md

```bash
deno run -A --unstable .\test_deno\aaa.ts

```

Marshal.AllocHGlobalでメモリ確保した後に
unsafeでデータ入れるならC＋＋と同じメモリ操作の動きになるっぽい。

サポートされているのはwindowsとlinuxのx86_64とarm。
macはサポートされていない。

LibraryImportは動的に読み込むライブラリ。
runtime側のOSにあること前提の動き。

https://learn.microsoft.com/en-us/dotnet/core/rid-catalog

dotnetのAOTではstructのポインタを作れないので、まだ使うのは待った方が良い。

System.Runtime.InteropServices.MarshalDirectiveException:
Struct 'Wrapper' requires marshalling that is not yet supported by this compiler.
