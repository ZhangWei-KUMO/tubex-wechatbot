 
const getRanker = async () => {
    try {
      const res = await fetch("https://www.binance.com/fapi/v1/ticker/24hr", {
        method: 'GET',
      });
        const items = await res.json();
        items.sort((a, b) => {
            return b.priceChangePercent - a.priceChangePercent
        })
      // 遍历所有的交易对
      const newItems = [];
        items.forEach(item => {
          // 删除symbol中的USDT,其余字段将字符串转换成数字
           
            // 过滤涨幅小于10%和交易量小于5000万的交易对
            if(parseFloat(item.priceChangePercent) < 10 || parseFloat(item.quoteVolume) < 50000000) return
            // 如果交易对位AGIXUSDT、OCEANUSDT则过滤
            if(item.symbol === "AGIXUSDT" || item.symbol === "OCEANUSDT") return
            // 如果交易量大于10亿则为市场热点
            if(parseFloat(item.quoteVolume) > 1000000000) item.市场热点 = true
            const obj = {
                "数字货币":item.symbol.replace("USDT",""),
                // 保留小数点后两位
                "交易额": (parseFloat(item.quoteVolume)/100000000).toFixed(2)+"亿",
                "涨幅":(parseFloat(item.priceChangePercent).toFixed(1))+"%",
                "当前价格":parseFloat(item.lastPrice).toFixed(3)+"$",
            }
            newItems.push(obj)
        });
     
       return newItems
    } catch (err) {
      console.error(err);
     
    }
  };

  console.log(await getRanker())