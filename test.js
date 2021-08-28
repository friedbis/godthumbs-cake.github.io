const kuroshiro=require('kuroshiro');
const KuromojiAnalyzer=require("kuroshiro-analyzer-kuromoji");


var test=async()=>{
    await kuroshiro.init(KuromojiAnalyzer);
    const result = await kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { to: "hiragana" });

    console.log(result);
}
test();
