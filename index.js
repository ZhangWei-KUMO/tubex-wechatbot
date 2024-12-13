/* eslint-disable no-undef */
import {bot,difyChat} from './util/init.js';
import fs from 'fs';
import xml2js from 'xml2js';
import {sendMessage,convertSilkToWav,readSheet,readTxt,
  readWord, readPDF,saveInLongMemory} from './util/util.js'
import {recognizeSpeech} from './util/azure.js'
import { config } from 'dotenv';
import {splitTextIntoArray} from './util/reply-filter.js'
import schedule from 'node-schedule';
import {getNews} from './util/group.js'
import { WebSocketServer } from "ws"
import express from 'express';
import path from 'path';
import open from 'open';
import {log,getLogs,deleteLogs} from './db/logs.js'
import {chat,getChats,deleteChats} from './db/chats.js'
import {getConfig,saveConfig} from './db/config.js'
import { fileURLToPath } from 'url';  // Import fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const wss = new WebSocketServer({ port: 1983 })
//  限制 WebSocketServer 的最大连接数
wss.setMaxListeners(20);  //  或者设置为更合适的数值

const app = express();
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

const port = 3000;

config();
console.log("微信机器人启动，版本号：",bot.version());

export async function prepareBot() {
  bot.on("message", async (message) => {  
    const contact = message.talker();
    // 自己的信息的直接无视
    if (contact.self()) {
      return;
    } 
    // 属于群聊的聊天信息
    if (message.room()) {
      let roomMsg = message.room()
      let {payload} = roomMsg;
      // 群名称
      let {topic} = payload;
      // 获取当前群聊名称
      let mentionText = await message.mentionText();
      if (await message.mentionSelf()) {
        if (roomMsg) {
          let answer = await difyChat(roomMsg.id,mentionText)
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
                  await sendMessage(talkerId, '👌🏻')
                  return
                }
                try{
                  let q = await recognizeSpeech(wav)
                  fs.unlinkSync(wav)
                  // 获取群名称
                  let answer = await difyChat(roomMsg.id,q)
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
    let {payload} = message;
    let {talkerId,listenerId,text} = payload;

    switch (message.type()) {
      case 0:
        await sendMessage(talkerId, "感谢老板抬爱，祝老板在缅A发财")
        break;
    case 7:
      if(talkerId!==listenerId && talkerId!=='weixin' && text!==''){
        if (text.includes('pictype=location')) {
          const lines = text.split(':');
          const locationText = `我的地址是：${lines[0]}`;
          saveInLongMemory(locationText,talkerId)          
        }else{
         
          chat(talkerId, text);
          let answer = await difyChat(talkerId,text) 
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
      break;
      // 图片消息
    case 6:
      chat(talkerId, '图片消息');
      break;
    case 11:
      { const xmlstr = payload.text;
      xml2js.parseString(xmlstr, async (err, result) => {
    if (err) {
      await sendMessage(talkerId, '收到');
    } else {
      const title = result.msg.appmsg[0].des[0];
      const regex = /\d+(\.\d+)?/;
      const num = title.match(regex);
      await sendMessage(talkerId, '收到');
      saveInLongMemory(`好友转账给你${num[0]}元`,talkerId)
    }
  });
      break; }
    case 14:
      { let xmlstr2 = payload.text;
      xml2js.parseString(xmlstr2, async (err, result) => {
    if (err) {
      console.error(err);
    } else {
      const title = result.msg.appmsg[0].title[0];
      saveInLongMemory( `分享给你一篇微信文章：《${title}》`,talkerId)
    }
  });
      break; }
      // 小程序卡片消息
    case 9:
      try{
        const miniProgram = await message.toMiniProgram();
        console.log(miniProgram)
        await sendMessage(talkerId, "真不错，待会不忙的时候会看下");
      }catch(e){
        await sendMessage(talkerId, e)
        return
      }
      break;
      // 语音消息
    case 2:
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
            let answer = await difyChat(talkerId,q)
            await sendMessage(talkerId,answer)
          }catch(e){
            await sendMessage(talkerId, e)
            return
          }
        })
      }catch(e){  
        console.error(e)
      }
      break;
      // 视频消息
    case 15:
      break;
      // 动图表情消
    case 5:
      break;
      // 文件消息
    case 1:
      try{
        const attachFileBox = await message.toFileBox();
        let mediaType = attachFileBox._mediaType
        let filename = attachFileBox._name;
        const attachData = await attachFileBox.toBuffer();
        if(mediaType.includes('pdf')){
          let text = await readPDF(filename,attachData);
          saveInLongMemory(`对方发来一份PDF文件，内容如下：${text}`,talkerId)
        }else if(mediaType.includes('sheet')){
          let text = await readSheet(filename,attachData)
          saveInLongMemory(`对方发来一份EXCEL文件，内容如下：${text}`,talkerId)
        }else if(mediaType.includes('document')){
          let text = await readWord(filename,attachData)
          saveInLongMemory(`对方发来一份WORD文件，内容如下：${text}`,talkerId)
        }else if(mediaType.includes('txt')){
          let text = await readTxt(filename,attachData)
          saveInLongMemory(`对方发来一份TXT文件，内容如下：${text}`,talkerId)
        }else{
          await sendMessage(talkerId, "好的，我先看下");
        }
      }catch(e){
        console.error(e)
      }
      break;
    default:
      break;
    }
  });

  bot.on("friendship", async (friendship) => {
    try {
      const contact = friendship.contact();
      switch (friendship.type()) {  
      case bot.Friendship.Type.Receive:
        await friendship.accept()  
        await contact.say(process.env.WELCOME_TEXT)
        break  
      }
    } catch (e) {
      console.error(e)
    }
  });

  bot.on('scan', (qrcode) => {
    wss.on('connection', function connection(ws) {
      ws.send(qrcode);
    })
  })

  // wss.on('connection', function connection(ws) {
  //   bot.on('scan', (qrcode) => { // 将 scan 事件处理程序放在 connection 内部
  //       ws.send(qrcode);
  //   });
  // });


  bot.on("login", (user) => {
    let {payload} = user;
    let {name} = payload;
    log('info', "机器人登录成功，账号名："+name);
  })

  bot.on("logout", async (user) => {
    let {payload} = user;
    let {name} = payload;
    log('info', name+"退出登录");
  })

  bot.on("error", (e) => {
    console.log(e)
    log('error', e);
  })
  // 启动的时间会比较久
  bot.on("ready",async ()=>{
    let rooms = await bot.Room.findAll()
    let id = ""
    rooms.filter(room=>{
      if(process.env.MANAGE_ROOMS.includes(room.payload.topic)){
        id = room.id
      }
    });

    if(process.env.IS_PUSH_MESSAGE){
      const rule = new schedule.RecurrenceRule();
      rule.hour = process.env.SCHEDULE_HOUR
      rule.minute =  process.env.SCHEDULE_MINUES
      // 中国上海时间
      rule.tz = 'Asia/Shanghai';
      schedule.scheduleJob(rule, async()=>{
        let {data} = await getNews();
        if(data){
          let answer = await difyChat(id,`请根据当前的经济数据，对当前市场进行分析`)
          // 过滤文字中的*
          answer = answer.replace(/\*/g, '');                
          await sendMessage(id, answer);
        }
      });
    }
  })

  await bot.start();
  await bot.ready();
  return bot;
}

async function startBot() {
    app.use(express.static(path.join(process.cwd(), 'public'))); // Assuming your HTML is in 'public'
  
    app.get('/api/logs', (req, res) => {
      getLogs().then((data) => {
        res.json(data);
      });
    });
    // 删除全部日志
    app.delete('/api/logs', (req, res) => {
      deleteLogs().then((data) => {
        res.json(data);
      });
    });
     // 删除全部聊天记录
     app.delete('/api/chats', (req, res) => {
      deleteChats().then((data) => {
        res.json(data);
      });
    });
    // 获取全部聊天记录
    app.get('/api/chats', (req, res) => {
      getChats().then((data) => {
          res.json(data);
      });
    });
    // 获取配置信息
    app.get('/api/settings', (req, res) => {
      getConfig().then((data) => {
          res.json(data);
      });
    });
    // 更新配置信息
    app.post('/api/settings', (req, res) => {
      const config = req.body;
      saveConfig(config).then((data) => {
          res.json(data);
      });
    });
    app.get('/settings', (req, res) => {
      res.sendFile(path.join(__dirname, './public/settings.html')); 
    });
    app.get('/docs', (req, res) => {
        res.sendFile(path.join(__dirname, './public/docs.html')); 
    });
    app.get('/poster', (req, res) => {
      res.sendFile(path.join(__dirname, './public/poster.html')); 
    });
    app.get('/chats', (req, res) => {
      res.sendFile(path.join(__dirname, './public/chats.html')); 
    });
    app.get('/logs', (req, res) => {
      res.sendFile(path.join(__dirname, './public/logs.html')); 
    });
    app.get('/knowledge', (req, res) => {
      res.sendFile(path.join(__dirname, './public/knowledge.html')); 
    });
    app.listen(port, async () => {
       console.log(`Web server listening at http://localhost:${port}`);
       await open(`http://localhost:${port}`);
    });
  await prepareBot();

}

startBot().catch(console.error);

process.on('exit', async(code) => {
  log('warning', "程序退出"+code);
});

process.on('SIGINT', async () => {
  log('warning', "程序退出");
  wss.close(); //  关闭 WebSocket 服务器
  await bot.logout();
  process.exit();
});

process.on('uncaughtException', async (err) => {
  console.error('抛出异常退出:', err);
});

