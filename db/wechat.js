import sqlite3 from 'sqlite3';

// 数据库文件名
const dbFile = 'wechats.db'; //  使用 users.db 存储用户信息

// 创建数据库连接
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        // 创建用户表（如果不存在）
        db.run(`
            CREATE TABLE IF NOT EXISTS wechats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                wechatid TEXT,
                avatar TEXT,
                friends TEXT,
                rooms TEXT,
                loginurl TEXT
            )
        `, (err) => {
                if (err) {
                    console.error("创建微信账户表失败:", err.message);
                } else {
                    const defaultConfig = {
                        username: '',
                        wechatid: '',
                        avatar: '',
                        friends: '', 
                        loginurl: '', 
                    };
                    insertWechat(defaultConfig) 
                }
            });
        }
    });

    function insertWechat(config) {
        const { username, wechatid,avatar, friends,  rooms,loginurl } = config;
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO wechats (username, wechatid,avatar, friends, rooms,loginurl) VALUES (?, ?, ?, ?, ?, ?)`,
                [username, wechatid,avatar, friends,  rooms,loginurl],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
        });
    }
    
    export function getWechatConfig() {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM wechats WHERE id = 1`, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null); // No config found.
                } else {
                    resolve(row);
                }
            });
        });
    }

export function saveWechatConfig(config) {
    const { username, wechatid,avatar, friends,rooms, loginurl } = config;
    return new Promise((resolve, reject) => {
        db.run(`UPDATE wechats SET username = ?,wechatid= ?, avatar = ?, friends = ?,rooms = ?, loginurl = ? WHERE id = 1`, 
            [username, wechatid,avatar, friends, rooms,loginurl],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}

// 更新好友列表
export function updateWechatFriends(friends) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE wechats SET friends = ? WHERE id = 1`, 
            [friends],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}

// 更新房间列表
export function updateWechatRooms(rooms) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE wechats SET rooms = ? WHERE id = 1`, 
            [rooms],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}


