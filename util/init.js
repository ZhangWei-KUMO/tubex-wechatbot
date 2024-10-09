/* eslint-disable no-undef */
import { WechatyBuilder } from 'wechaty';
import { config } from 'dotenv';
config();
import { PuppetWechat4u } from 'wechaty-puppet-wechat4u';
import Redis from 'ioredis';
import fs from 'fs';
import {getNews} from './group.js'

const redis = new Redis();

export const difyChat = async (talkid,query) => {
  console.log("query",query)
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
    if(/币安|比特币|以太坊|BTC|ETH|数字货币|加密货币|加密市场/.test(query)){
        try {
          let res = await fetch(process.env.BINANCE_TOPSEARCH);
          let topsearchList = await res.json();
          let { data } = topsearchList;
      
          // 使用 map 并行获取价格信息
          const pricePromises = data.slice(0, 5).map(async (element) => {
            let res = await fetch(process.env.BINANCE_PRICE + element.symbol);
            let symbolInfo = await res.json();
            return `名称：${symbolInfo.symbol} | 
                    最新价格：${symbolInfo.lastPrice}| 
                    开盘价：${symbolInfo.openPrice}| 
                    最高价：${symbolInfo.highPrice}| 
                    最低价：${symbolInfo.lowPrice};
                   `;
          });
      
          // 等待所有价格信息获取完毕
          const priceInfo = await Promise.all(pricePromises);
      
          // 使用 join 拼接字符串
          dataInfo = "今天的热门币种为：" + priceInfo.join("");
      
        } catch (error) {
          console.error("获取热门币种信息出错:", error);
          return "获取热门币种信息出错，请稍后再试";
        }
    }else{
      let {data} = await getNews();
      dataInfo = data
    }

    console.log("dataInfo",dataInfo)

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
    console.log(res)
    if(res.answer){
      return res.answer;
    }else{
      console.error(res)
      await redis.del(`talkid:${talkid}`)
      return "啊~这~";
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