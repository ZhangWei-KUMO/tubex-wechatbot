

export const getNews = async () => {
  try {
    const URL = 'https://api-one-wscn.awtmt.com/apiv1/search/live?channel=global-channel&limit=40&score=2';
    const etag = 'VKikV7rHg+OhU+DW+HiofA=='; 
    const res = await fetch(URL, {
      method: 'GET',
      headers: {
        'If-None-Match': etag
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