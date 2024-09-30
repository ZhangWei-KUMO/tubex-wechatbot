/* eslint-disable no-undef */

import {transporter,mailOptionsBigquant} from './mailer.js';

export const getNews = async () => {
  try {
    const res = await fetch(process.env.NEWS_ENDPOINT, {
      method: 'GET',
      headers: {
        'If-None-Match': process.env.NEWS_ETAG
      },
    });
    const wallstreetNews = await res.json();
    if (wallstreetNews.code === 20000) {
      let news = "";
      wallstreetNews.data.items.forEach((item) => {
        if(item.title){
          item.content = item.content.replace(/<[^>]+>/g,""); 
          news += `《${item.title}》${item.content}\n`;
        }
      });
      return { data:news};

    } else {
      return { data:null};
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({error: err instanceof Error ? err.message : 'Unknown error'}), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const getStockPlan = async () => {
  const headers = {
    'cookie': `bigquantsessionid=${process.env.BIGQUANT_SESSIONID}; __bqssid=${process.env.BIGQUANT_SSID};`,
  };
  try {
    const res = await fetch(process.env.BIGQUANT_API_ENDPOINT, {
      method: 'GET',
      headers: headers
    });
    const jsonp = await res.json();
    if(jsonp.data.planned_order_lists){
      let first = jsonp.data.planned_order_lists[0]
      if(first.name.includes("*")){
         // 发送邮件
         transporter.sendMail(mailOptionsBigquant, (error) => {
          if (error) {
            return console.error(error);
          }
        });
        return null
      }else{
        // 发送消息
        // 遍历数组，合并成字符串
        let text = jsonp.data.planned_order_lists.map((item) => {
          return `${item.name} ${item.direction} 交易价格：${item.price}元`;
        }).join('\n');
        return text 
      }
    }
    console.log(jsonp.data.planned_order_lists)
  } catch (err) {
    console.error(err);
  }
};