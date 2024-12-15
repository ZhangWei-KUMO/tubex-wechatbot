// index.js
/* eslint-disable no-undef */
import {bot} from './util/init.js';
import {sendMessage} from './util/util.js'
import { config } from 'dotenv';
import express from 'express';
import {log} from './db/logs.js'
import { singleChat,groupChat,handleFile, handleImage,handleAudio,handleVideo,handleGIF,handleTransfer,handlePush } from './util/handle.js';
import router from './router/router.js';
import staticRouter from './router/static.js';
import {saveWechatConfig} from './db/wechat.js';
// import {Jimp} from 'jimp';

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
    saveWechatConfig({loginurl:qrcode,wechatid:'',username:'',avatar:'',friends:''})
  })

  bot.on("login", async (user) => {
    const selfContact = bot.currentUser;
    let dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2MBERISGBUYLxoaL2NCOEJjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY//AABEIACgAKAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/ANjbXq3PPK1yw81UbAjT55Cf0H9fwrjxE7+6dVCP2jAub5r/AFSGPYyoGyFPoOa5GdkS7F/qg394k1izoQ49KRTN51CxsWJUAZJHavZcrI8FK7sYV3dukkduA/mTHc7nt/s/gBXnSle7PShG2hQQL/aNzIOkURA+vT/GpNepdjXbGq+gxWLNkKTzTAdDqF7Isy3DgqnJVkAwewyK6pTb0ZwxpxVmkU4yXu4dwA2oXOOgzWR0JWIbJgz3UbgrK0ihgewzmh7ArXNMxuSzBTtX26VnYvmSJlswsi75k5568fjTtYzdRvRGc91PcwN5jAknaoVcVo3cUVYrXhmtoLi42lFYCNSePy/X8qErsJSsiv4ZBnupzI+SVHzO3Q8+tOaMotnXi5EMrxqpn3DAMajAx2rO5e5HcXBkt1aK22unzMDjp7UrsEkZ9vEsKAuAFUZ3e/etbEc1zC17U478rBbjCR8sx7nGK0jCxDkXPDlqyWhnAbc7ZyFxjHTn86zk9S47HQWknkXO9mLqI8Nzu2+1ZlCw2cEm/Lthjyd344o0Hqf/2Q==';

    try {
      const selfAvatarFileBox = await selfContact.avatar();
      if (selfAvatarFileBox.buffer) {
        const buffer = await selfAvatarFileBox.toBuffer();
        // const image = await Jimp.read(buffer);
        // const compressedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        const base64 = buffer.toString('base64');
        dataUrl = `data:image/jpeg;base64,${base64}`;
      }
    } catch (e) {
      log('error', "获取头像失败"+e);
    }
    saveWechatConfig({username:user.payload.name,wechatid:user.payload.id,avatar:dataUrl,loginurl:'',friends:''})
    log('info', "机器人登录成功，账号名："+user.payload.name);
  })

  bot.on("logout", async (user) => {
    log('info', user.payload.name+"退出登录");
  })

  bot.on("error", (e) => {
    let text = e
    if(`${e}`.includes("AssertionError: 400 != 400")){
      text = "获取微信二维码超时5分钟"
    }
    log('error', text);
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