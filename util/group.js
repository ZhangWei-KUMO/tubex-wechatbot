

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