 
export async function splitTextIntoArray(text) {
  // 使用正则表达式通过\n分割字符串
  let parts = text.split('\n\n');
  // 去除空格
  parts = parts.map(part => part.trim());
  // 去除空字符串
  parts = parts.filter(part => part !== '');
  return parts;
}

export function suspendQueue(array) {
  if (array.length <= 3) {
    const interval = setInterval(() => {
      if (array.length) {
        console.log(array.shift());
      } else {
        clearInterval(interval);
      }
    }, 5000);
  } else {
    console.log('数组长度不能大于3');
  }
}