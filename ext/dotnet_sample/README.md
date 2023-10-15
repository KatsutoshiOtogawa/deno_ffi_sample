# How to build


https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/?tabs=net7%2Cwindows#prerequisites

https://learn.microsoft.com/ja-jp/dotnet/api/system.runtime.interopservices.unmanagedcallersonlyattribute?view=net-7.0

 dotnet publish -c Release -r win-x64


BitTableがサポートされているものしか使えない。
https://learn.microsoft.com/ja-jp/dotnet/framework/interop/blittable-and-non-blittable-types

Booleanが無いので、注意。

https://github.com/dotnet/runtime/blob/main/src/coreclr/nativeaot/docs/compiling.md
