#!/bin/bash
set -e

# 作業ディレクトリの作成
mkdir -p storage/literature
cd storage/literature

# 作品のダウンロードと展開関数
fetch_work() {
    local url=$1
    local zip_name=$2
    local txt_pattern=$3
    local output_name=$4

    echo "Fetching $output_name..."
    curl -L -o "$zip_name" "$url"
    unzip -o "$zip_name"
    
    # Shift-JIS から UTF-8 への変換と整形 (ルビ削除など)
    # 1. iconv で UTF-8 に変換
    # 2. sed でルビ 《...》 を削除
    # 3. sed で注釈 ［...］ を削除
    # 4. 前後の不要なメタデータを適宜削除 (手動で行うのは難しいので、ある程度は残るが可)
    rm -f tmp.txt
    iconv -f SHIFT-JIS -t UTF-8 "$txt_pattern" > tmp.txt
    
    sed -e 's/《[^》]*》//g' -e 's/［[^］]*］//g' tmp.txt > "$output_name"
    
    rm "$zip_name" "$txt_pattern" tmp.txt
}

# 走れメロス
fetch_work "https://www.aozora.gr.jp/cards/000035/files/1567_ruby_4948.zip" "melos.zip" "hashire_merosu.txt" "melos.txt"

# 吾輩は猫である (第一章付近)
fetch_work "https://www.aozora.gr.jp/cards/000148/files/789_ruby_5639.zip" "cat.zip" "wagahaiwa_nekodearu.txt" "cat.txt"

# 羅生門
fetch_work "https://www.aozora.gr.jp/cards/000879/files/127_ruby_150.zip" "rashomon.zip" "rashomon.txt" "rashomon.txt"

echo "Literature data fetched and cleaned successfully."
ls -lh *.txt
