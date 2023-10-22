using System.Runtime.InteropServices;
using System.Text;
using CsharpPtr = System.IntPtr;
// Byte配列へのポインタ
using BytespPtr = System.IntPtr;

using System.Diagnostics.CodeAnalysis;

namespace dotnet_sample;

public partial class Lib
{
    public class Content {
        public string mes;

        public Content(string mes)
        {

            this.mes = mes;
        }
        public  void Print() {
            System.Console.WriteLine(mes);
        }
    }
    public struct Wrapper {

        public Content content;
        
        public Wrapper(Content content)
        {
            this.content = content;
        }
    }
    [UnconditionalSuppressMessage("AOT", "IL3050:Calling members annotated with 'RequiresDynamicCodeAttribute' may break functionality when AOT compiling.", Justification = "<Pending>")]
    public readonly static int Wrapper_Size = Marshal.SizeOf(typeof(Wrapper));

}

public partial class Lib
{
#if WINDOWS_ARM64 || WINDOWS_AMD64
    // [LibraryImport("C:/Windows/SysWOW64/msvcrt.dll")]
    [LibraryImport("msvcrt.dll")]
// libc.soはシンボリックリンクのため、直接指定する。
#elif LINUX_AMD64
// debianは/lib/x86_64-linux-gnu/libc.so.6 osによってパスが違う。
    [LibraryImport("/lib/x86_64-linux-gnu/libc.so.6")]
#elif LINUX_ARM64
    [LibraryImport("/lib/aarch64-linux-gnu/libc.so.6")]
#endif
    [UnmanagedCallConv(CallConvs = new Type[] { typeof(System.Runtime.CompilerServices.CallConvCdecl) })]
    private static partial IntPtr malloc(int size);

    [UnmanagedCallersOnly(EntryPoint = "Malloc")]
    public static IntPtr Malloc(Int32 size) {

        return malloc(size);
    }

#if WINDOWS_ARM64 || WINDOWS_AMD64
    // [LibraryImport("C:/Windows/SysWOW64/msvcrt.dll")]
    [LibraryImport("msvcrt.dll")]
    // libc.soはシンボリックリンクのため、直接指定する。
#elif LINUX_AMD64
    [LibraryImport("/lib/x86_64-linux-gnu/libc.so.6")]
#elif LINUX_ARM64
    [LibraryImport("/lib/aarch64-linux-gnu/libc.so.6")]
#endif
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

        IntPtr ptr =  malloc(8);
        unsafe {
            *(Int64* )ptr.ToPointer() = 1234;
        }
        return ptr;
    }

    // dotnetのAllocHGlobalを使った実装。
    [UnmanagedCallersOnly(EntryPoint = "ReturnPointer2")]
    public static BytespPtr ReturnPointer2() {

        // Cのメモリを確保アドレス番地を返す。
        IntPtr ptr = Marshal.AllocHGlobal(8);
        Marshal.WriteInt64(ptr, 5678);
        return ptr;
    }

    // Cのオブジェクトをラッピングしている構造のポインタの作成
    [UnmanagedCallersOnly(EntryPoint = "ReturnPointer3")]
    public static BytespPtr ReturnPointer3() {

        // Cのメモリを確保アドレス番地を返す。
        IntPtr ptr = Marshal.AllocHGlobal(Wrapper_Size);
        var content = new Content("Pointer");

        // 割り当てたアドレスを入れる。
        Marshal.StructureToPtr(new Wrapper(content), ptr, false);
        return ptr;
    }

    [UnmanagedCallersOnly(EntryPoint = "PointerUse2")]
    public static void PointerUse2(IntPtr ptr) {

        // allocしたメモリを値に戻す。
        Int64 value = Marshal.ReadInt64(ptr);
        
        System.Console.WriteLine(value);
    }

    [UnmanagedCallersOnly(EntryPoint = "PointerUse3")]
    public static void PointerUse3(IntPtr ptr) {

        var wrapper = Marshal.PtrToStructure<Wrapper>(ptr);

        // 構造体から使いたい処理を呼び出す。
        wrapper.content.Print();
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
