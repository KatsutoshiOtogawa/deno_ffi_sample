package main

/*
#include <stdio.h>
#include <stdlib.h>
*/
import "C"

// "Cだけ分けて書く必要がある。"

import (
	"fmt"
	"os"
	"unsafe"
)

type point struct {
	X int64
	Y int64
}

// malloc時に必要な大きさ。
const Point_Size = (C.ulong)(unsafe.Sizeof(point{}))


func main() {
	// サクッと、対話形式でやるとか。
	// pythonのmainみたいな感じと思えば良い。
	// 必要ないなら。os.exit(0)を返すなど最低限の処理だけ
	// 書けば容量は取らない。
	os.Exit(0)
}

//export HelloWorld
func HelloWorld() {
    fmt.Println("Hello World")
}

func (p point) PrintPoint() {
	fmt.Println(Point_Size)
	fmt.Println(p.X, p.Y)
}

//export Point
func Point(x int64, y int64) unsafe.Pointer{
	ptr := C.malloc(Point_Size)
	p := (*point)(ptr)

	p.X = 16
	p.Y = 32

	return ptr
}	

//export PrintPoint
func PrintPoint(ptr unsafe.Pointer) {
	ppoint := (*point)(ptr)
	ppoint.PrintPoint()
}

// Cが作った配列以外使わない。
func unsafe_strlength(s *byte) int{
	// uintptr は単なる数字のため、*uintptrとしてもアドレスの参照ができない
	// 一度unsafe.Pointerに直してから、(*型名)とキャストする必要がある。

	// 0にぶつかるまで探す必要がある。
	n := 0
	for ptr := s; *ptr != 0; n++ {
		ptr = (*byte)(unsafe.Pointer(uintptr(unsafe.Pointer(ptr)) + 1))
	}
	return n
}

// exportを行わないと呼べない。
// *C.charは*byteと等しい。[]byteはuint8arrayのため最後に0がある。
//export Println_GO
func Println_GO(s *byte, length int64) {
	str := unsafe.String(s, length)

	fmt.Println(str)
}

// Cの昨日を呼び出すため、import "C"が必要になる。
//export Println_C
func Println_C(s *C.char) {
	// goの文字列にする。
	var str = C.GoString(s)

	fmt.Println(str)
}

//export Add_GO
func Add_GO(x int64, y int64) int64 {
	return x + y
}

// longはcpuに応じた大きさを返す。64bitならgoのint64扱い。
//export Add_C
func Add_C(x C.long, y C.long) C.long {
	return C.long(x + y)
}

//export Free_Memory
func Free_Memory(ptr unsafe.Pointer) {
	C.free(ptr)
}

// 文字列を返すならCStringに変換して返す。
// 呼び出した側で文字列をコピーした後に削除。
// 
//export Return_Buffer
func Return_Buffer() unsafe.Pointer {

	// 8バイト取得
	buffer := C.malloc(8)

	*(*int64)(buffer) = 1234

	return buffer;
	// data := C.malloc(8)
    // defer C.free(data)

    // *(*int64)(data) = 1234
    // a := *(*int64)(data)
    // fmt.Printf("a=%d\n", a)
    // return nil

	// var i int
	// ポインタの変数からアドレスを引き出す。
	// uintptr(i)
	// var mes = "Hello Return"
	// var mes_con = mes + "abc"

}

// import "unsafe"

// func main() {
//   p := C.CString("lorem ipsum")
//   defer C.free(unsafe.Pointer(p))
//   C.func_to_export(p)
// }
