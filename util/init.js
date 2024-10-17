/* eslint-disable no-undef */
import { WechatyBuilder } from 'wechaty';
import { config } from 'dotenv';
config();
import { PuppetWechat4u } from 'wechaty-puppet-wechat4u';
import fs from 'fs';
import {getNews} from './group.js'
import {classfication, symbolCheck,chat} from './gemini.js'
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
          time:moment(item.display_time).format("YYYY-MM-DD HH"),
          content:item.content_text
        }
      })
      return `股票${stockName}的相关信息：${JSON.stringify(timelines)}`
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
              最新价格：${Number(symbolInfo.lastPrice)>1?Number(symbolInfo.highPrice).toFixed(0):Number(symbolInfo.lastPrice)}| 
              开盘价：${Number(symbolInfo.openPrice)>1?Number(symbolInfo.openPrice).toFixed(0):Number(symbolInfo.openPrice)}| 
              最高价：${Number(symbolInfo.highPrice)>1?Number(symbolInfo.highPrice).toFixed(0):Number(symbolInfo.highPrice)}| 
              最低价：${Number(symbolInfo.lowPrice)>1?Number(symbolInfo.lowPrice).toFixed(0):Number(symbolInfo.lowPrice)}|
              交易量：${Number(symbolInfo.volume)>1?Number(symbolInfo.volume).toFixed(0):Number(symbolInfo.volume)}
              ;
             `;
      }
      });

    const priceInfo = await Promise.all(pricePromises);
    return "参考信息：币安热门数字币榜单：" + priceInfo.join("");

  } catch (error) {
    console.error("获取加密货币市场信息出错:", error);
    return "获取加密货币市场信息出错，请稍后再试";
  }
}
export const difyChat = async (talkid,query) => {
  const filePath = `./logger/${talkid}.json`;
  let longMemory = "";
  if (fs.existsSync(filePath)) {
      longMemory = fs.readFileSync(filePath, 'utf-8');
      // 清空该文件
      fs.writeFileSync(filePath, '[]', 'utf-8');
  }
  console.log("长记忆::",longMemory)
  try{
    let type =  await classfication(query);
    type = type.trim()
    console.log(type)
    switch(type){
     
      case "数字货币":
        { let basicCryptoMarketInfo = await fetchBasicCryptoMarketInfo();
          query = query +"。"+basicCryptoMarketInfo
          break; 
        }
      case "股票":
          { 
            let news = await getNews(query);
            query = query +"。这是今天的经济新闻："+news.data
            break; 
          }
      case "原油":
        query = query +"。已知信息：原油信息"
        break;
      case "外汇":
        query = query +"。已知信息：外汇信息"
        break;
      case "其他":
        query = query +"。已知信息：其他信息"
        break;
      default:
        break;
    }
  }catch(e){
    query = query +"。已知信息：其他信息"+e
  }
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