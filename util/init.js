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
  try{
    const filePath = `./logger/${talkid}.json`;
    let longMemory = "";
    if (fs.existsSync(filePath)) {
      longMemory = fs.readFileSync(filePath, 'utf-8');
      // 清空该文件
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
    let lastConversationId = await redis.get(`talkid:${talkid}`);
    let {data} = await getNews();
    let params = {
      inputs:{
        longMemory:longMemory+"。今天的经济新闻:"+data,
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