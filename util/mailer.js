/* eslint-disable no-undef */
import nodemailer from 'nodemailer';
import {getEmailConfig} from '../db/email.js'
let config = await getEmailConfig()

// 创建邮件发送者对象
export let transporter = nodemailer.createTransport({
  host: config.smtpHost || process.env.EMAIL_HOST, // SMTP 服务器地址
  port: Number(config.smtpPort) || process.env.EMAIL_PORT, // SMTP 端口
  secure: true, // 如果端口是465，将其设置为true；否则设置为false
  auth: {
    user: config.sender || process.env.EMAIL_FROM, // 你的邮箱账号
    pass: config.password || process.env.EMAIL_FROM_PASSWORD // 你的邮箱密码
  }
});

// 设置邮件内容（谁发送什么给谁）
export let mailOptions = {
  from: `<${config.sender}>`, // 发送人
  to: config.receiver, // 接收人
  subject: config.title,
  html: config.content
};


export let Bigquant = {
  from: `<${process.env.EMAIL_FROM}>`, // 发送人
  to: process.env.EMAIL_TO, // 接收人
  subject: 'Bigquant Session登录过期', // 邮件主题
  html: 'Bigquant Session登录过期，请重新登录后配置' // 邮件内容
};

