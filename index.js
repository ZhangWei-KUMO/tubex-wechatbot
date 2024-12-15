// index.js
/* eslint-disable no-undef */
import {bot} from './util/init.js';
import {sendMessage} from './util/util.js'
import { config } from 'dotenv';
import express from 'express';
import {log} from './db/logs.js'
import { singleChat,groupChat,handleFile, handleImage,handleAudio,handleVideo,handleGIF,handleTransfer } from './util/handle.js';
import router from './router/router.js';
import staticRouter from './router/static.js';
import {saveWechatConfig} from './db/wechat.js';
const port = 3000;
config();
const app = express();
app.use(router);
app.use(staticRouter);
export async function prepareBot() {
  bot.on("message", async (message) => {  
    const contact = message.talker();
    if (contact.self()) {
      return;
    } 
    if (message.room()) {
      groupChat(message,talkerId)
    }
    let {payload} = message;
    let {talkerId,listenerId,text} = payload;
    switch (message.type()) {
      case 0:
        await sendMessage(talkerId, "感谢老板抬爱，祝老板在缅A发财")
        break;
      case 1:
          await handleFile(message,talkerId)
          break;
      case 2:
          await handleAudio(message,talkerId)
          break;
      case 5:
          await handleGIF(message,talkerId)
          break;
      case 7:
        await singleChat(talkerId,listenerId,text)
        break;
      case 6:
        await handleImage(message,talkerId)
        break;
      case 11:
        { const xmlstr = payload.text;
          handleTransfer(xmlstr,talkerId)
          break; 
        }
    case 14:
      { 
        handleArticle(payload.text,talkerId)
        break; 
      }
    case 9:
      await handleMiniProgram(message,talkerId)
      break;
    case 15:
      await handleVideo(message,talkerId)
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
    saveWechatConfig({loginurl:qrcode})
  })

  bot.on("login", (user) => {
    console.log(user)
    saveWechatConfig({username:user.payload.name,wechatid:user.payload.id,avatar:user.payload.avatar,loginurl:'',friends:JSON.stringify(user.payload.friendList)})
    log('info', "机器人登录成功，账号名："+user.payload.name);
  })

  bot.on("logout", async (user) => {
    log('info', user.payload.name+"退出登录");
  })

  bot.on("error", (e) => {
    log('error', "微信端传出错误"+e);
  })

  bot.on("ready",async ()=>{
    let rooms = await bot.Room.findAll()
    await handlePush(rooms)
  })

  await bot.start();
  await bot.ready();
  return bot;
}

async function startBot() {
   app.listen(port, async () => {
       console.log(`Web server listening at http://localhost:${port}`);
      //  await open(`http://localhost:${port}`);
    });
  await prepareBot();

}

startBot().catch(console.error);

process.on('exit', async(code) => {
  log('warning', "程序退出"+code);
});

process.on('SIGINT', async () => {
  log('warning', "程序退出");
  await bot.logout();
  process.exit();
});

process.on('uncaughtException', async (err) => {
  console.error('抛出异常退出:', err);
});