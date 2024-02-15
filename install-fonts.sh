mkdir vendor
cd vendor
curl -LO https://github.com/aosp-mirror/platform_frameworks_base/raw/jb-mr2.0.0-release/data/fonts/AndroidEmoji.ttf
curl -L https://github.com/google/fonts/raw/main/ofl/notoemoji/NotoEmoji%5Bwght%5D.ttf -o NotoEmoji[wght].ttf
git clone https://github.com/googlefonts/noto-emoji
