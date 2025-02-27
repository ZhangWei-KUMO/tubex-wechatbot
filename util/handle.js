import {chat} from '../db/chats.js'
import {sendMessage,saveInLongMemory,convertSilkToWav,readPDF,readWord,readSheet,readTxt} from './util.js'
import {think} from './init.js';
import {splitTextIntoArray} from './reply-filter.js'
import {recognizeSpeech} from './azure.js'
import xml2js from 'xml2js';
import fs from 'fs';
import process from 'process';
import schedule from 'node-schedule';
import {getNews} from './group.js'
import {saveFlashMemory} from '../db/flashmemories.js'
import {getConfig} from '../db/config.js'
let config = await getConfig();

export const singleChat = async (talkerId,listenerId,text) => {
    if(talkerId!==listenerId && talkerId!=='weixin' && text!==''){
        if (text.includes('pictype=location')) {
          const lines = text.split(':');
          const locationText = `我的地址是：${lines[0]}`;
          saveInLongMemory(locationText,talkerId)          
        }else{
          let answer = await think(talkerId,text) 
          if(answer){ 
            answer = answer.replace(/\*/g, '');                
            answer = answer.trim()
            if(answer.includes("\n")){
              let array =  await splitTextIntoArray(answer)
              const interval = setInterval(async () => {
                if (array.length) {
                  await sendMessage(talkerId, array.shift())
                } else {
                  clearInterval(interval);
                }
              }, 3000);
            }else{
              await sendMessage(talkerId, answer);
            }   
          }
        }
        return
      }
}
// 处理群聊信息
export const groupChat = async (message) => {
    let roomMsg = message.room()
    let {payload} = roomMsg;
    // 群名称
    let {topic} = payload;
    // 获取当前群聊名称
    let mentionText = await message.mentionText();
    if (await message.mentionSelf()) {
      if (roomMsg) {
        let answer = await think(roomMsg.id,mentionText)
        answer = answer.replace(/\*/g, '');         
        if(answer.includes("\n")){
          let array =  await splitTextIntoArray(answer)
          const interval = setInterval(async () => {
            if (array.length) {
              await sendMessage(roomMsg.id, array.shift())
            } else {
              clearInterval(interval);
            }
          }, 3000);
        }else{
          await sendMessage(roomMsg.id, answer);
        }   
        return;
      }
    }else{
      let {payload} = message;
      let {text} = payload;
      if(text.includes("加入群聊")){
        if (roomMsg) {
          await sendMessage(roomMsg.id, process.env.GROUP_GREET);
          return;
        }
      }else{
        // 正常聊天
        switch (message.type()) {
          // 被人拍了拍
          case 0:
            await sendMessage(roomMsg.id, "找我搞么事？");
            break;
        case 2:
          try{
            const audioFileBox = await message.toFileBox();
            const silkBuffer = await audioFileBox.toBuffer();
            let wav = await convertSilkToWav(silkBuffer)
            fs.access(wav, fs.constants.F_OK, async (err) => {
              if(err){
                await sendMessage(roomMsg.id, '👌🏻')
                return
              }
              try{
                let q = await recognizeSpeech(wav)
                fs.unlinkSync(wav)
                // 获取群名称
                let answer = await think(roomMsg.id,q)
                answer = answer.replace(/\*/g, '');         
                if(answer.includes("\n")){
                  let array =  await splitTextIntoArray(answer)
                  const interval = setInterval(async () => {
                    if (array.length) {
                      await sendMessage(roomMsg.id, array.shift())
                    } else {
                      clearInterval(interval);
                    }
                  }, 3000);
                }else{
                  await sendMessage(roomMsg.id, answer);
                }   
              }catch(e){
                await sendMessage(roomMsg.id, e)
                return
              }
            })
          }catch(e){  
            console.error(e)
          }
          break;
        case 7:
          chat(topic, message.payload.text);
          break;
        default:
          return
        }
      }
    }
    return;
}

export const handleFile = async (message,talkerId) => {
    try{
        const attachFileBox = await message.toFileBox();
        let mediaType = attachFileBox._mediaType
        let filename = attachFileBox._name;
        const attachData = await attachFileBox.toBuffer();
        if(mediaType.includes('pdf')){
          let text = await readPDF(filename,attachData);
          saveFlashMemory(talkerId, "文件内容如下："+text, 'file')
        }else if(mediaType.includes('sheet')){
          let text = await readSheet(filename,attachData)
          saveFlashMemory(talkerId, "文件内容如下："+text, 'file')
        }else if(mediaType.includes('document')){
          let text = await readWord(filename,attachData)
          saveFlashMemory(talkerId, "文件内容如下："+text, 'file')
        }else if(mediaType.includes('txt')){
          let text = await readTxt(filename,attachData)
          saveFlashMemory(talkerId, "文件内容如下："+text, 'file')
        }else{
          await sendMessage(talkerId, "好的，我先看下");
        }
      }catch(e){
        console.error(e)
      }
}

export const handleAudio = async (message,talkerId) => {
    try{
        const audioFileBox = await message.toFileBox();
        const silkBuffer = await audioFileBox.toBuffer();
        let wav = await convertSilkToWav(silkBuffer)
        fs.access(wav, fs.constants.F_OK, async (err) => {
          if(err){
            await sendMessage(talkerId, '👌🏻')
            return
          }
          try{
            let q = await recognizeSpeech(wav)
            fs.unlinkSync(wav)
            let answer = await think(talkerId,q)
            await sendMessage(talkerId,answer)
          }catch(e){
            await sendMessage(talkerId, e)
            return
          }
        })
      }catch(e){  
        console.error(e)
      }
}

export const handleMiniProgram = async (message,talkerId) => {
    try{
        const miniProgram = await message.toMiniProgram();
        let {payload} = miniProgram;
        let{description,title} = payload;
        saveFlashMemory(talkerId, description+title, 'miniProgram')
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}

export const handleVideo = async (message,talkerId) => {
    try{
        // const videoFileBox = await message.toFileBox();
        // let video = await videoFileBox.toFile();
        await sendMessage(talkerId, "好的，我先看下");
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}

export const handleGIF = async (message,talkerId) => {
    try{
        await sendMessage(talkerId, "666");
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}

// 处理转账信息
export const handleTransfer = async (xmlstr,talkerId) => {
    xml2js.parseString(xmlstr, async (err, result) => {
        if (err) {
          await sendMessage(talkerId, '收到');
        } else {
          const title = result.msg.appmsg[0].des[0];
          const regex = /\d+(\.\d+)?/;
          const num = title.match(regex);
          await sendMessage(talkerId, `收到${num[0]}元`);
        }
    });
}

// 处理微信文章分享
export const handleArticle = async (xmlstr,talkerId) => {
    xml2js.parseString(xmlstr, async (err, result) => {
        if (err) {
        console.error(err);
      } else {
        const title = result.msg.appmsg[0].title[0];
        saveInLongMemory( `分享给你一篇微信文章：《${title}》`,talkerId)
      }
    });
}

function stringToArray(str) {
  if (!str) {
    return []; // 处理空字符串或 undefined 的情况
  }

  return str.split(',').map(item => item.trim()).filter(item => item !== "");
}

export const getBinanceRanker = async () => {
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

// 处理主动推送信息
export const handlePush = async (rooms) => {
   let {groups,isPushEnable,isEnable,pushTime} = config;
   // 当AI开启情况下，推送启动及各项配置均已满足则进入推送机制；
   if(groups && isPushEnable && isEnable && pushTime){
      let groupArray = stringToArray(groups);
      const rule = new schedule.RecurrenceRule();
      const times = pushTime.split(":")
      rule.hour = times[0]
      rule.minute =  times[1]
      rule.tz = 'Asia/Shanghai';
      const filteredRooms = rooms.filter(room => {
        if (!room || !room.payload || !room.payload.topic) {
          return false;  // 如果 room, room.payload 或者 room.payload.topic 不存在则跳过
        }
        const topic = room.payload.topic;
        return groupArray.some(group => topic.trim() === group.trim());
      });
      schedule.scheduleJob(rule, async()=>{
        let {data} = await getNews();
        let cryptoInfo = await getBinanceRanker()
        filteredRooms.forEach(async room => {
          let answer = chat("请将下列文字转换成一个严肃专业的报告："+data+cryptoInfo);
          await sendMessage(room.id, answer);
        });
      })
    };
   }
  
// 处理图片，该函数的触发条件是指用户在当前文本信息之前发送了一张图片
export const handleImage = async (message, talkerId) => {
  try{
    const imageFileBox = await message.toFileBox();
    let buffer = await imageFileBox.toBuffer();
    let mimeType = imageFileBox.mimeType
    if (!mimeType) {
       await sendMessage(talkerId, '无法获取图片 mimeType，请检查图片格式');
       return
    }
    let base64String = buffer.toString("base64")
    // 存入记忆中
    saveFlashMemory(talkerId, base64String, 'image')
}catch(e){
    // 修改这里，提取错误信息
    let errorMessage = `图片处理出错: ${e.message || String(e)}`;
    await sendMessage(talkerId, errorMessage);
    return
}
} 