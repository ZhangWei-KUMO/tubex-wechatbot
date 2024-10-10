/* eslint-disable no-undef */
import { WechatyBuilder } from 'wechaty';
import { config } from 'dotenv';
config();
import { PuppetWechat4u } from 'wechaty-puppet-wechat4u';
import Redis from 'ioredis';
import fs from 'fs';
import {getNews} from './group.js'
import moment from 'moment';
const redis = new Redis();

export const difyChat = async (talkid,query) => {
  console.log("query:",query)
  try{
    const filePath = `./logger/${talkid}.json`;
    let longMemory = "";
    if (fs.existsSync(filePath)) {
      longMemory = fs.readFileSync(filePath, 'utf-8');
      // 清空该文件
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
    let lastConversationId = await redis.get(`talkid:${talkid}`);
    /**
     * 如果用户提及币安、比特币、以太坊、BTC、ETH、数字货币、加密货币等关键词请求，直接返回说自己不知道。
     * 请使用正则表达式匹配
     */
    let dataInfo = ""
    let coinInfo = ""
    if(/币圈|币安|比特币|以太坊|BTC|ETH|数字货币|加密货币|加密市场/.test(query)){
        try {
          let res = await fetch(process.env.BINANCE_TOPSEARCH);
          let topsearchList = await res.json();
          let { data } = topsearchList;
      
          // 获取排名前10的数字货币信息
          let hotCoins = [];
          const pricePromises = data.slice(0, 6).map(async (element) => {
            let res = await fetch(process.env.BINANCE_PRICE + element.symbol);
            let symbolInfo = await res.json();
            // 过滤字符串中的USDT
            hotCoins.push(symbolInfo.symbol.replace("USDT", ""));
            symbolInfo.symbol = symbolInfo.symbol.replace("USDT", "");
            return `数字货币：${symbolInfo.symbol} | 
                    最新价格：${symbolInfo.lastPrice}| 
                    开盘价：${symbolInfo.openPrice}| 
                    最高价：${symbolInfo.highPrice}| 
                    最低价：${symbolInfo.lowPrice}|
                    交易量：${symbolInfo.volume}
                    ;
                   `;
            });
            
          // 等待所有价格信息获取完毕
          const priceInfo = await Promise.all(pricePromises);
      
          // 使用 join 拼接字符串
          coinInfo = "今天的热门币种为：" + priceInfo.join("");
          if(/走势|趋势|预测|未来|分析|研究|研报|研判/.test(query)){
            // 检查字符串中是否包含hotCoins中的币种,该币种的名称可能是大写也可能是小写，大小写都需要匹配，然后转换成大写
            let coin = hotCoins.find((coin) => new RegExp(coin, "i").test(query));
            if(!coin){
              return "我只能分析热门币种的走势哦~";
            }
            let res = await fetch(process.env.BINANCE_KLINE+coin+"USDT");
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
            // 遍历转换成json对象格式
            klines= klines.map((kline) => {
              return {
                "开盘时间": moment(kline[0]).format("YYYY-MM-DD HH"),
                "开盘价": kline[1],
                "收盘价": kline[4],
                "交易量": kline[5],
                "成交额": kline[7],
                "主动买入成交额": kline[10],
              };
            });
            coinInfo += `数字货币${coin}的K线：${JSON.stringify(klines)}`;
         
          }
        } catch (error) {
          console.error("获取热门币种信息出错:", error);
          return "获取热门币种信息出错，请稍后再试";
        }
        query = query +"。已知信息："+coinInfo
    }else{
      let {data} = await getNews();
      dataInfo = data
    }

    console.log("dataInfo:",dataInfo)

    let params = {
      inputs:{
        longMemory:longMemory,
        data:dataInfo
      },
      response_mode:'blocking',
      user:talkid,
      query: query
    }
    if (lastConversationId) {
      params.conversation_id = lastConversationId;
    }
    let res = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`
      },
      body: JSON.stringify(params)
    });
  
    res = await res.json();
    // 检查 conversation_id 是否存在，并与 Redis 中的记录相比较
    if (res && res.conversation_id) {
      if (lastConversationId !== res.conversation_id) {
        // 如果 Redis 中不存在或值有变化，则更新 Redis 数据
        await redis.set(`talkid:${talkid}`, res.conversation_id);
      }
    }
    if(res.answer){
      return res.answer;
    }else{
      await redis.del(`talkid:${talkid}`)
      return res.code+":"+res.message;
    }
  }catch(e){
    console.log("Dify Error：",e)
    await redis.del(`talkid:${talkid}`)
  }
}

const puppet = new PuppetWechat4u()

export const bot = WechatyBuilder.build({
  puppet,
  name:process.env.BOT_NAME,
}) 

export async function logout() {
  await puppet.logout()
}