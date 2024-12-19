import { updateWechatFriends,updateWechatRooms } from "../db/wechat.js";

const WECHAT_ICON = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2MBERISGBUYLxoaL2NCOEJjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY//AABEIACgAKAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/ANjbXq3PPK1yw81UbAjT55Cf0H9fwrjxE7+6dVCP2jAub5r/AFSGPYyoGyFPoOa5GdkS7F/qg394k1izoQ49KRTN51CxsWJUAZJHavZcrI8FK7sYV3dukkduA/mTHc7nt/s/gBXnSle7PShG2hQQL/aNzIOkURA+vT/GpNepdjXbGq+gxWLNkKTzTAdDqF7Isy3DgqnJVkAwewyK6pTb0ZwxpxVmkU4yXu4dwA2oXOOgzWR0JWIbJgz3UbgrK0ihgewzmh7ArXNMxuSzBTtX26VnYvmSJlswsi75k5568fjTtYzdRvRGc91PcwN5jAknaoVcVo3cUVYrXhmtoLi42lFYCNSePy/X8qErsJSsiv4ZBnupzI+SVHzO3Q8+tOaMotnXi5EMrxqpn3DAMajAx2rO5e5HcXBkt1aK22unzMDjp7UrsEkZ9vEsKAuAFUZ3e/etbEc1zC17U478rBbjCR8sx7nGK0jCxDkXPDlqyWhnAbc7ZyFxjHTn86zk9S47HQWknkXO9mLqI8Nzu2+1ZlCw2cEm/Lthjyd344o0Hqf/2Q==';

const getAvatar = async (friend) => {
    try {
      const filebox = await friend.avatar();
      if (filebox && filebox.buffer) {
        const buffer = await filebox.toBuffer();
        if(buffer){
            const base64 = buffer.toString('base64');
            const avatar = `data:image/jpeg;base64,${base64}`;
            return avatar;
        }else{
            console.log("获取头像失败")
        }
      }
      return WECHAT_ICON
    } catch (e) {
      console.log(e)
      return WECHAT_ICON
    }
  };

  async function getRoomFriends(contactList){
    const friendList = (await Promise.all(contactList.map(async (contact) => {
      const { id, name } = contact.payload;
      return {  id, name };
    }))).filter(Boolean);
    return friendList;
  }

  export async function saveWechatFriends(contactList) {
    const friendList = (await Promise.all(contactList.map(async (contact) => {
        const { friend, type, alias, id, name } = contact.payload;
        // 防止非好友和群友和公众号被加入
        if (friend && type === 1) {
            const avatar = await getAvatar(contact);
            if (avatar) {
                return { friend, type, alias, id, name, avatar };
            }else{
              return null;
            }
        }
        return null; 
    }))).filter(Boolean); 
    updateWechatFriends(JSON.stringify(friendList));
    return friendList;
}

export async function saveWechatRooms(roomList){
  // 机器人启动后，获取所有群聊
    const rooms = await Promise.all(roomList.map(async (room) => {        
        let roomFriendList = await room.memberAll();
        let memberList = await getRoomFriends(roomFriendList);
        const {topic, id} = room.payload;
        return {topic, memberList,avatar:WECHAT_ICON, id}
      }))
    updateWechatRooms(JSON.stringify(rooms))
     return rooms
}