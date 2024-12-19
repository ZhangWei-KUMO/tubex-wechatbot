/* eslint-disable no-undef */
import { WechatyBuilder } from 'wechaty';
import { config } from 'dotenv';
config();
import { PuppetWechat4u } from 'wechaty-puppet-wechat4u';
import fs from 'fs';
import {getNews} from './group.js'
import {classfication, stockCheck,chat} from './gemini.js'
import moment from 'moment';
import 'dotenv/config'
// import Redis from 'ioredis';
// const redis = new Redis();
const fetchStockInfo = async (stockName) => {
  try{
    let res = await fetch(`https://api-one-wscn.awtmt.com/apiv1/search/live?&cursor=&limit=5&query=${stockName}`);
    let timenews = await res.json();
    if(timenews.code===20000){
      let timelines = timenews.data.items.map((item) => {
        return {
          // time:moment(item.display_time).format("YYYY-MM-DD HH"),
          content:item.content_text
        }
      })
      return `${JSON.stringify(timelines)}`
    }else{
      return "无相关股票信息"
    }
  }catch(e){
    console.log("获取股票信息出错：",e)
    return "获取股票信息出错，请稍后再试"
  }
}

const fetchKlines = async (symbol, interval='1h', limit=100) => {
  try{
    let res = await fetch(`https://api.binance.com/api/v3/klines?interval=${interval}&limit=${limit}&symbol=${symbol}USDT`);
    /**
     * @param {Array} klines
     * @param {String} kline[0] 开盘时间
     * @param {String} kline[1] 开盘价
     * @param {String} kline[2] 最高价
     * @param {String} kline[3] 最低价
     * @param {String} kline[4] 收盘价
     * @param {String} kline[5] 交易量
     * @param {String} kline[6] 收盘时间
     * @param {String} kline[7] 成交额
     * @param {String} kline[8] 成交笔数
     * @param {String} kline[9] 主动买入成交量
     * @param {String} kline[10] 主动买入成交额
     */
    let klines = await res.json();
    if(klines && Array.isArray(klines)){
        // 遍历转换成json对象格式
    klines= klines.map((kline) => {
      if(kline[0] && Number(kline[1])){
        return {
          "开盘时间": moment(kline[0]).format("YYYY-MM-DD HH"),
          "开盘价": kline[1],
          "收盘价": kline[4],
          "成交额": kline[7],
          "主动买入成交额": kline[10],
        };
      }
    });
    return`数字货币${symbol}的K线：${JSON.stringify(klines)}`;
    }
  
  }catch(e){
    console.log("获取K线数据出错：",e)
    return "获取K线数据出错，请稍后再试"
  }
}

const fetchBasicCryptoMarketInfo = async () => {
  try {
    let res = await fetch(process.env.BINANCE_TOPSEARCH);
    let topsearchList = await res.json();
    let { data } = topsearchList;
    // 获取排名前10的数字货币信息
    let hotCoins = [];
    const pricePromises = data.slice(0, 10).map(async (element) => {
      let res = await fetch(process.env.BINANCE_PRICE + element.symbol);
      let symbolInfo = await res.json();
      // 过滤字符串中的USDT
      if(symbolInfo.symbol){
        hotCoins.push(symbolInfo.symbol.replace("USDT", ""));
        symbolInfo.symbol = symbolInfo.symbol.replace("USDT", "");
      }
      
      if(symbolInfo.symbol && Number(symbolInfo.lastPrice)){
        return `数字货币：${symbolInfo.symbol} | 
              最新价格：${Number(symbolInfo.lastPrice)>100?Number(symbolInfo.highPrice).toFixed(0):Number(symbolInfo.lastPrice)}| 
              开盘价：${Number(symbolInfo.openPrice)>100?Number(symbolInfo.openPrice).toFixed(0):Number(symbolInfo.openPrice)}| 
              最高价：${Number(symbolInfo.highPrice)>100?Number(symbolInfo.highPrice).toFixed(0):Number(symbolInfo.highPrice)}| 
              最低价：${Number(symbolInfo.lowPrice)>100?Number(symbolInfo.lowPrice).toFixed(0):Number(symbolInfo.lowPrice)}|
              交易量：${Number(symbolInfo.volume)>100?Number(symbolInfo.volume).toFixed(0):Number(symbolInfo.volume)}
              ;
             `;
      }
      });

    const priceInfo = await Promise.all(pricePromises);
    return "币安热门数字币榜单：" + priceInfo.join("");

  } catch (error) {
    console.error("获取加密货币市场信息出错:", error);
    return "获取加密货币市场信息出错，请稍后再试";
  }
}

 
const getBinanceRanker = async () => {
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
          // 如果交易对位AGIXUSDT、OCEANUSDT则过滤，如果包含USDC则过滤
          if(item.symbol === "AGIXUSDT" || item.symbol === "OCEANUSDT" || item.symbol.includes("USDC")) return
          
          // 如果交易量大于10亿则为市场热点
          if(parseFloat(item.quoteVolume) > 1000000000) item.市场热点 = true
          const obj = {
              "数字货币":item.symbol.replace("USDT",""),
              "交易额": (parseFloat(item.quoteVolume)/100000000).toFixed(2)+"亿",
              "涨幅":(parseFloat(item.priceChangePercent).toFixed(1))+"%",
              "当前价格":parseFloat(item.lastPrice).toFixed(3)+"$",
          }
          newItems.push(obj)
      });
      // 转换成字符串输出
      let str = newItems.map((item) => {
        return `数字货币：${item.数字货币} | 交易额：${item.交易额} | 涨幅：${item.涨幅} | 当前价格：${item.当前价格}`;
      }).join("\n");
   
     return str
  } catch (err) {
    console.error(err);
   
  }
};

export const think = async (talkid,query) => {
  // const filePath = `./logger/${talkid}.json`;
  // let longMemory = "";
  // if (fs.existsSync(filePath)) {
  //     longMemory = fs.readFileSync(filePath, 'utf-8');
  //     // 清空该文件
  //     fs.writeFileSync(filePath, '[]', 'utf-8');
  // }
  // console.log("文件记忆::",longMemory)
  // try{
    
    // let type =  await classfication(query);
    // type = type.trim()
    // console.log(type)
    // switch(type){
     
    //   case "数字货币":
    //     { let basicCryptoMarketInfo = await getBinanceRanker();
    //       console.log("。当前币安涨幅榜："+basicCryptoMarketInfo)
    //       query = query +"。当前币安涨幅榜："+basicCryptoMarketInfo+"。判断标准：数字货币交易额超过10亿或者涨幅超过40%表示当前数字货币处于狂热状态，否则为正常状态，如果所有的交易对的涨幅都为负数则表示当前市场处于恐慌状态。"
    //       break; 
    //     }
    //   case "股票":
    //       { 
    //         let stock = await stockCheck(query);
    //         if(stock=="0"){
    //           let news = await getNews(query);
    //           query = `扮演一名与客户对话的金融专家，已经获取的知识储备如下:${news.data},你可以参考这些信息回答问题。问题：${query}`
    //         }else{
    //           let stockInfo = await fetchStockInfo(stock);
    //           console.log(stockInfo)
    //           if(stockInfo=='[]'){
    //             let news = await getNews(query);
    //             query = `扮演一名与客户对话的金融专家，已经获取的知识储备如下:${news.data},你可以参考这些信息回答问题。问题：${query}`
    //           }else{
    //             query = `扮演一名与客户对话的金融专家，已经获取的知识储备如下:${stockInfo},你可以参考这些信息回答问题。问题：${query}`
    //           }
    //         }
           
    //         break; 
    //       }
    //   case "原油":
    //     query = query +"。已知信息：原油信息"
    //     break;
    //   case "外汇":
    //     query = query +"。已知信息：外汇信息"
    //     break;
    //   case "其他":
    //     { 
    //       let stock = await stockCheck(query);
    //       if(stock=="0"){
    //         let news = await getNews(query);
    //         query = query +"before you'r:"+news.data
    //       }else{
    //         let stockInfo = await fetchStockInfo(stock);
    //         console.log(stockInfo)
    //         if(stockInfo=='[]'){
    //           let news = await getNews(query);
    //           query = `扮演一名与客户对话的金融专家，已经获取的知识储备如下:${news.data},你可以参考这些信息回答问题。问题：${query}`
    //         }else{
    //           query = `扮演一名与客户对话的金融专家，已经获取的知识储备如下:${news.data},你可以参考这些信息回答问题。问题：${stockInfo}`
    //         }
    //       }
         
    //       break; 
    //     }
    //   default:
    //     break;
    // }
  // }catch(e){
  //   query = query +"。已知信息：其他信息"+e
  // }
  return await chat(query)
}

const puppet = new PuppetWechat4u()

export const bot = WechatyBuilder.build({
  puppet,
  name:process.env.BOT_NAME,
}) 

export async function logout() {
  await puppet.logout()
}