/* eslint-disable no-undef */
import nodemailer from 'nodemailer';
// 创建邮件发送者对象
export let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // SMTP 服务器地址
  port: process.env.EMAIL_PORT, // SMTP 端口
  secure: true, // 如果端口是465，将其设置为true；否则设置为false
  auth: {
    user: process.env.EMAIL_FROM, // 你的邮箱账号
    pass: process.env.EMAIL_FROM_PASSWORD // 你的邮箱密码
  }
});

// 设置邮件内容（谁发送什么给谁）
export let mailOptions = {
  from: `<${process.env.EMAIL_FROM}>`, // 发送人
  to: process.env.EMAIL_TO, // 接收人
  subject: process.env.EMAIL_SUBJECT, // 邮件主题
  html: process.env.EMAIL_HTML // 邮件内容
};


export let mailOptionsBigquant = {
  from: `<${process.env.EMAIL_FROM}>`, // 发送人
  to: process.env.EMAIL_TO, // 接收人
  subject: 'Bigquant Session登录过期', // 邮件主题
  html: 'Bigquant Session登录过期，请重新登录后配置' // 邮件内容
};

