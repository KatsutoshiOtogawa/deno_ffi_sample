// 初期化処理
import { join } from 'path/mod.ts';

async function removeCache() {
  
    const deno_dir = Deno.env.get("DENO_DIR")

    if (!deno_dir) {
        // 異常終了を通知する
        Deno.exit(1);
    }

    // ファイルの存在確認
    // remove cache directory
    await Deno.remove(join(deno_dir, "plug"), { recursive: true });
}

export {
    removeCache
}
