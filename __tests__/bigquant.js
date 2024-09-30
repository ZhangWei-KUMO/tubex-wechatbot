 
const headers = {
    'cookie': 'bigquantsessionid=h0nce18c2zq0m47gp4c0uy7aqny1fhy0; __bqssid=b7fa0a900caf7ba307c2a35fe6d8587e;',
  };

const getRanker = async () => {
    try {
      const res = await fetch("https://bigquant.com/bigwebapi/algo_info/planned_order?owner=lewiszhang&notebook_id=65fd9aa4-8be7-11ed-930e-ce97c77929cd&limit=1", {
        method: 'GET',
        headers: headers
      });
      const jsonp = await res.json();
      console.log(jsonp.data.planned_order_lists)
    } catch (err) {
      console.error(err);
     
    }
  };

  getRanker()