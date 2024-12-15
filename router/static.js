// static.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticRouter = express.Router();

// eslint-disable-next-line no-undef
staticRouter.use(express.static(path.join(process.cwd(), 'public')));

staticRouter.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, './public/settings.html')); 
  });
  staticRouter.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './public/login.html')); 
  });
  staticRouter.get('/docs', (req, res) => {
      res.sendFile(path.join(__dirname, './public/docs.html')); 
  });
  staticRouter.get('/poster', (req, res) => {
    res.sendFile(path.join(__dirname, './public/poster.html')); 
  });
  staticRouter.get('/chats', (req, res) => {
    res.sendFile(path.join(__dirname, './public/chats.html')); 
  });
  staticRouter.get('/logs', (req, res) => {
    res.sendFile(path.join(__dirname, './public/logs.html')); 
  });
  staticRouter.get('/knowledge', (req, res) => {
    res.sendFile(path.join(__dirname, './public/knowledge.html')); 
  });
  staticRouter.get('/email', (req, res) => {
    res.sendFile(path.join(__dirname, './public/email.html')); 
  });
  staticRouter.get('/forgetpassword', (req, res) => {
    res.sendFile(path.join(__dirname, './public/forgetpassword.html')); 
  });
  staticRouter.get('/voice', (req, res) => {
    res.sendFile(path.join(__dirname, './public/voice.html')); 
  });
  staticRouter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html')); 
  });

  export default staticRouter;