const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('node:fs/promises'); // 使用 promises API
const path = require('node:path');
const axios = require('axios'); // 用于调用 API


// 配置项
const API_URL = 'YOUR_API_ENDPOINT'; // 替换为你的 API 地址
const TEMPLATE_PATH = './template.png'; // 替换为你的模板图片路径
const OUTPUT_PATH = './poster.png'; // 替换为输出海报的路径
const FONT_PATH = './your-font.ttf'; // 替换为你的字体文件路径


async function generatePoster() {
  try {
    // 1. 加载模板图片和字体
    const template = await loadImage(TEMPLATE_PATH);
    registerFont(FONT_PATH, { family: 'YourFontName' }); // 注册字体

    // 2. 创建 Canvas
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    // 3. 绘制模板图片
    ctx.drawImage(template, 0, 0);

    // 4. 调用 API 获取数据
    const response = await axios.get(API_URL);
    const data = response.data; 
    const value = data.value || 0; // 获取 API 返回值，如果不存在则默认为 0，确保值在 0-10 之间
    const displayValue = Math.max(0, Math.min(10, value));


    // 5. 绘制动态文本
    ctx.font = '48px YourFontName'; // 设置字体大小和名称
    ctx.fillStyle = '#000000'; // 设置字体颜色
    ctx.textAlign = 'center'; // 设置文本对齐方式
    ctx.fillText(`今日数值: ${displayValue}`, canvas.width / 2, canvas.height / 2); // 在画布中心绘制文本,  根据需要调整位置


    // 6. 保存海报图片
    const buffer = canvas.toBuffer('image/png');
     await fs.writeFile(OUTPUT_PATH, buffer);  // 使用异步写入
    console.log('海报已生成:', OUTPUT_PATH);

  } catch (error) {
    console.error('生成海报失败:', error);
  }
}


generatePoster();