
クロスコンパイル

https://pkg.go.dev/cmd/cgo

package 名は共有ライブラリは
-buildmode=c-shared requires exactly one main package

共有ライブラリだが、mainが必須になる。
runtime.main_main·f: function main is undeclared in the main package

ヘッダーファイルが必ず一緒についてくる。
いらなかったら削除しても良い。

goの構造体は関数は同じヒープ領域に確保しない。

なのでこの使い方に向いているかも。

rustとの比較

goの方がデバッグ楽、読みやすい、クロスコンパイル簡単、安全なコード書きやすい、
goの方がポインタが複雑で無い。

goの方がgoで完結している処理が遅い

go build -buildmode=c-shared -o out/libgo_sample.so main.go

```bash
go tool dist list
```

linuxは
deno側でlibなんたら.soと書式が決まっているのでそれに従う。

GOOS GOARCH CGO_ENABLEはクロスコンパイルを行わない場合は不要。

```bash

# macをクロスコンパイルしたい場合
sudo apt install clang
```

CC=arm-linux-gnueabihf-gcc

CC=x86_64-linux-gnueabihf-gcc

```bash
# linux
go build -buildmode=c-shared -o out/libgo_sample.so main.go

GOOS=windows GOARCH=amd64 CGO_ENABLED=1 go build -buildmode=c-shared -o out/go_sample.dll main.go

GOOS=darwin GOARCH=amd64 CGO_ENABLED=1 go build -buildmode=c-shared -o out/libgo_sample.dylib main.go
```


darwin/amd64

linux/amd64

GOOS=windows GOARCH=amd64


[golang cc](https://zenn.dev/mattn/articles/23f4e202eb1f35)

