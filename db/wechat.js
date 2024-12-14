import sqlite3 from 'sqlite3';

// 数据库文件名
const dbFile = 'users.db'; //  使用 users.db 存储用户信息


// 创建数据库连接
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('连接用户数据库');
        // 创建用户表（如果不存在）
        db.run(`
            CREATE TABLE IF NOT EXISTS wechats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                wechatid TEXT NOT NULL,
                avatar TEXT NOT NULL,
                friends TEXT NOT NULL,
                loginurl TEXT NOT NULL,
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
                    insertWechat(defaultConfig) // Use the insertConfig function
                        .then(() => console.log("写入默认配置"))
                        .catch(err => console.error("写入数据错误:", err));
                }
            });
        }
    });

    function insertWechat(config) {
        const { username, wechatid,avatar, friends, loginurl } = config;
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO wechats (username, wechatid,avatar, friends, loginurl) VALUES (?, ?, ?, ?, ?)`,
                [username, wechatid,avatar, friends, loginurl],
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
            db.get(`SELECT * FROM wechats WHERE id = 1`, [], (err, row) => {  // Select the first row
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null); // No config found.
                } else {
    
                    // Convert isEnable back to boolean
                    row.isEnable = !!row.isEnable; 
                    row.isPushEnable = !!row.isPushEnable; 
                    resolve(row);
                }
            });
        });
    }



// Helper function to update config
export function updateWechatConfig(config) {
    const { username, wechatid,avatar, friends, loginurl } = config;
    return new Promise((resolve, reject) => {
        db.run(`UPDATE wechats SET username = ?,wechatid= ?, avatar = ?, friends = ?, loginurl = ? WHERE id = 1`, 
            [username, wechatid,avatar, friends, loginurl],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}

