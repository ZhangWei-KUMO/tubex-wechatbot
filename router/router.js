// router.js
import express from 'express';
import {getLogs,deleteLogs} from '../db/logs.js';
import {getChats,deleteChats} from '../db/chats.js';
import {getConfig,saveConfig} from '../db/config.js';
import {getAgentConfig,saveAgentConfig} from '../db/agent.js';
import {getEmailConfig,saveEmailConfig} from '../db/email.js';
import {getTTSConfig,saveTTSConfig} from '../db/tts.js';
import {verifyUser,updateUser} from '../db/users.js';
import {getWechatConfig,saveWechatConfig} from '../db/wechat.js';
import {AUTH_CONFIG,isAuthenticated} from './index.js';
import session from 'express-session';
import {transporter,mailOptions} from '../util/mailer.js';
import {saveImage,getImage,getImages,deleteImage,deleteImages} from '../db/images.js';
import {getFlashMemories,deleteFlashMemories} from '../db/flashmemories.js';

const router = express.Router();

router.use(express.json());

router.use(express.urlencoded({ extended: true }));
router.use(session(AUTH_CONFIG));
router.use(isAuthenticated);


router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    let verified = await verifyUser(username, password)
    if (verified) {
      req.session.user = username;
      res.send({message:'登录成功',status:200});
    } else {
      res.send({message:'用户名或密码错误',status:401});
    }
  });

  router.post('/api/forgetpwd', async (req, res) => {
    const { username, password } = req.body;
    let updated = await updateUser(username, password,'admin')
    if (updated) {
      res.send({message:'修改成功',status:200});
    } else {
      res.send({message:'修改失败',status:401});
    }
  });
  // 退出
  router.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Logout failed");
      }
      res.redirect('/login');
    });
  });

  router.get('/api/logs', (req, res) => {
    // getLogs().then((data) => {
    //   res.json(data);
    // });
  });
  
  router.delete('/api/logs', (req, res) => {
    deleteLogs().then((data) => {
      res.json(data);
    });
  });
  
  router.delete('/api/chats', (req, res) => {
    deleteChats().then((data) => {
      res.json(data);
    });
  });
  
  router.get('/api/chats', (req, res) => {
    getChats().then((data) => {
        res.json(data);
    });
  });
  
  router.get('/api/settings', (req, res) => {
    getConfig().then((data) => {
        res.json(data);
    });
  });

  router.post('/api/settings', (req, res) => {
    const config = req.body;
    saveConfig(config).then((data) => {
        res.json(data);
    });
  });

  router.get('/api/email', (req, res) => {
    getEmailConfig().then((data) => {
        res.json(data);
    });
  });

  router.get('/api/testemail', (req, res) => {
    transporter.sendMail(mailOptions);
    res.json({msg:"邮件发送成功"})
  });

  router.post('/api/email', (req, res) => {
    const config = req.body;
    saveEmailConfig(config).then((data) => {
        res.json(data);
    });
  });

  router.get('/api/agent', (req, res) => {
    getAgentConfig().then((data) => {
        res.json(data);
    });
  });

  router.post('/api/agent', (req, res) => {
    const config = req.body;
    saveAgentConfig(config).then((data) => {
        res.json(data);
    });
  });
  router.get('/api/tts', (req, res) => {
    getTTSConfig().then((data) => {
        res.json(data);
    });
  });
  
  router.post('/api/tts', (req, res) => {
    const config = req.body;
    saveTTSConfig(config).then((data) => {
        res.json(data);
    });
  });

  router.get('/api/wechat', (req, res) => {
    getWechatConfig().then((data) => {
        res.json(data);
    });
  });

  router.post('/api/wechat', (req, res) => {
    const config = req.body;
    saveWechatConfig(config).then((data) => {
      console.log(data);
        res.json(data);
    });
  });
  // 上传图片
  router.post('/api/images', (req, res) => {
    const config = req.body;
    saveImage(config).then((data) => {
        res.json(data);
    });

  });
  // 获取图片
  router.get('/api/images', (req, res) => {
    getImages().then((data) => {
        res.json(data);
    });
  });
  // 删除图片
  router.delete('/api/images', (req, res) => {
    deleteImages().then((data) => {
      res.json(data);
    });
  });
  // 删除单张图片
  router.delete('/api/image/:id', (req, res) => {
    const id = req.params.id;
    deleteImage(id).then((data) => {
      res.json(data);
    });
  });
  // 获取单张图片
  router.get('/api/image/:id', (req, res) => {
    const id = req.params.id;
    getImage(id).then((data) => {
      res.json(data);
    });
  });
  // 获取flashmemory
  router.get('/api/flashmemory', (req, res) => {
    getFlashMemories().then((data) => {
      res.json(data);
  });
  });
  // 删除flashmemory
  router.delete('/api/flashmemory', (req, res) => {
    deleteFlashMemories().then((data) => {
      res.json(data);
    });
  });
export default router;