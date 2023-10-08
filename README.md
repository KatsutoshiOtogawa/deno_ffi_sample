
denoはmacはm1系列とx86_64
windows, linuxはx86_64をサポートしている

ただ、rust側の対応を調べると[rust公式のプラットフォーム](https://doc.rust-lang.org/nightly/rustc/platform-support.html)のサポートを見ると
m1 macはTier2のため、x86_64と比べて不安定かもしれない。
ただ、かなり動作すると書かれている。

## rust

### クロスコンパイル

rustの場合は難しいので*しない方が良い*。
deno公式もdeno、denoのffiの実行に使っていない。

じゃあどうやっているか？というとgithub actionから各osのコンテナインスタンス
からビルド、テストと実行している。

クロスコンパイルを行う場合は書き手順に従う。

targetの追加

```bash
rustup target add x86_64-unknown-linux-gnu
rustup target add x86_64-apple-darwin
```

```sh
cargo build --target x86_64-pc-windows-msvc
carto build --target x86_64-unknown-linux-gnu

cargo build --target x86_64-apple-darwin
# Tier2
cargo build --target aarch64-apple-darwin 
```

macで低レイヤーのインタフェースとしてはswiftの方が、
Windowsで低レイヤーのインターフェースとしてはdotnetの方が優秀な可能性はある。

特に各osの不具合や仕様についてはそっちのエンジニアの方が詳しいだろう。

問題はswiftや、dotnetのポインタや参照の操作をdenoは保証していないので、
そのswiftやdotnetからCのポインタや参照を作ってdenoに戻す必要があるということ。

dotnetはGCを使っているのと、初期化に時間がかかるので速度的には不利なのと、
core系と.net framework系と2分されているのがネック。

https://github.com/rust-lang/libc

### golang

googleはクロスコンパイルについてはおそらく、
msやappleよりも詳しいだろう。

gentooを採用した理由に

golangではクロスコンパイルが容易である。

[cgo](https://pkg.go.dev/cmd/cgo)

共有ライブラリや、ffiの知識も特にいらない。
mangleなんて知らなくてよいといたれり尽せり。

```bash
// linux
go build -buildmode=c-shared -o test.so test.go

go build -buildmode=c-shared -o 
```

new が無かったら、スタック領域なので

new があったら、heap領域なので、deleteがいる。

