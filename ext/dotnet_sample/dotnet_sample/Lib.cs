using System.Runtime.InteropServices;
using System.Text;
using CsharpPtr = System.IntPtr;
// Byte配列へのポインタ
using BytespPtr = System.IntPtr;


namespace dotnet_sample;

public partial class Lib
{
    // [LibraryImport("C:/Windows/SysWOW64/msvcrt.dll")]
    // [LibraryImport("msvcrt.dll")]
    // libc.soはシンボリックリンクのため、直接指定する。
    [LibraryImport("/usr/lib/aarch64-linux-gnu/libc.so.6")]
    [UnmanagedCallConv(CallConvs = new Type[] { typeof(System.Runtime.CompilerServices.CallConvCdecl) })]
    private static partial IntPtr malloc(int size);

    [UnmanagedCallersOnly(EntryPoint = "Malloc")]
    public static IntPtr Malloc(Int32 size) {

        return malloc(size);
    }

    // [LibraryImport("C:/Windows/SysWOW64/msvcrt.dll")]
    // [LibraryImport("msvcrt.dll")]
    // libc.soはシンボリックリンクのため、直接指定する。
    [LibraryImport("/usr/lib/aarch64-linux-gnu/libc.so.6")]
    [UnmanagedCallConv(CallConvs = new Type[] { typeof(System.Runtime.CompilerServices.CallConvCdecl) })]
    private static partial void free(IntPtr ptr);

    [UnmanagedCallersOnly(EntryPoint = "Free")]
    public static void Free(IntPtr ptr) {

        // メモリ開放
        free(ptr);
    }

    // csharpのunmagedなポインタ。cのポインタと仕様が違うかもなのでこれを使う。
    [UnmanagedCallersOnly(EntryPoint = "FreeHGlobal")]
    public static void FreeHGlobal(CsharpPtr ptr) {

        Marshal.FreeHGlobal(ptr);
        // メモリ開放
    }

    [UnmanagedCallersOnly(EntryPoint = "Multiply")]
    public static Int64 Multiply(Int64 a, Int64 b) => a * b;


    [UnmanagedCallersOnly(EntryPoint = "ReturnPointer")]
    public static BytespPtr ReturnPointer() {

        // var str = "Hello, Workd! Return Buffer";

        // byte[] byteArray = Encoding.UTF8.GetBytes(str + '\0');

        // var len = byteArray.Length;
        // Cのメモリを確保アドレス番地を返す。
;
        IntPtr ptr =  malloc(8);
        unsafe {
            *(Int64* )ptr.ToPointer() = 1234;
        }
        // IntPtr ptr;
        // unsafe {
        //     ptr = (Int64 *) malloc(8);
        //     *ptr = 1234;
        // }


        // for (int i=0; i< len; i++)
        // {
        //     Marshal.WriteByte(ptr, i, byteArray[i]);
        // }
        return ptr;
    }

    // dotnetのAllocHGlobalを使った実装。
    [UnmanagedCallersOnly(EntryPoint = "ReturnPointer2")]
    public static BytespPtr ReturnPointer2() {

        // var str = "Hello, Workd! Return Buffer";

        // byte[] byteArray = Encoding.UTF8.GetBytes(str + '\0');

        // var len = byteArray.Length;
        // Cのメモリを確保アドレス番地を返す。
        IntPtr ptr = Marshal.AllocHGlobal(8);
        unsafe {
            *(Int64* )ptr.ToPointer() = 5678;
        }
        // IntPtr ptr;
        // unsafe {
        //     ptr = (Int64 *) malloc(8);
        //     *ptr = 1234;
        // }


        // for (int i=0; i< len; i++)
        // {
        //     Marshal.WriteByte(ptr, i, byteArray[i]);
        // }
        return ptr;
    }
    // bufferを指すポインタを返す。ffi側のbufferの読み書きは未定義動作なので、
    // 読み込む場合はcsharp側に戻してから処理。
    [UnmanagedCallersOnly(EntryPoint = "ReturnBuffer")]
    public static BytespPtr ReturnBuffer() {

        var str = "Hello, Workd! Return Buffer";

        byte[] byteArray = Encoding.UTF8.GetBytes(str + '\0');

        var len = byteArray.Length;
        // Cのメモリを確保アドレス番地を返す。
        IntPtr ptr = malloc(len);
        for (int i=0; i< len; i++)
        {
            Marshal.WriteByte(ptr, i, byteArray[i]);
        }
        return ptr;
    }

    // bufferを指すポインタを返す。ffi側のbufferの読み書きは未定義動作なので、
    // 読み込む場合はcsharp側に戻してから処理。
    // AOTはByte配列で値を取れないのでポインタを使う。
    [UnmanagedCallersOnly(EntryPoint = "PrintBuffer")]
    public static void PrintBuffer(BytespPtr ptr, Int64 len) {

        // UTF-8エンコーディングを使用してchar[]をbyte[]に変換
        byte[] bytes = new byte[len];

        // // byte[]のデータをunmanagedなメモリにコピー
        // 2023ねん現在nintとintptrの仕様が変わったため、バグにより、Marshal.Copyがうまく使えない
        // またAOTとして正しい配列操作になるかわからないためforループで値を入れる。
        for (int i=0; i< len; i++)
        {
            bytes[i] = Marshal.ReadByte(ptr, i);
        }
        var str = Encoding.GetEncoding(Encoding.UTF8.CodePage).GetString(bytes);

        Console.WriteLine(str);
    }

    // bufferを指すポインタを返す。ffi側のbufferの読み書きは未定義動作なので、
    // 読み込む場合はcsharp側に戻してから処理。
    [UnmanagedCallersOnly(EntryPoint = "ReturnBuffer2")]
    public static CsharpPtr ReturnBuffer2() {

        var str = "Hello, Workd!";

        // UTF-8エンコーディングを使用してchar[]をbyte[]に変換
        byte[] byteArray = Encoding.UTF8.GetBytes(str);

        // // unmanagedなメモリを確保アドレス番地を返す。
        CsharpPtr ptr = Marshal.AllocHGlobal(byteArray.Length);

        // // byte[]のデータをunmanagedなメモリにコピー
        Marshal.Copy(byteArray, 0, ptr, byteArray.Length);
        return ptr;
    }
}
