import sqlite3 from 'sqlite3';
import moment from 'moment-timezone'; // Import moment-timezone for timezones

// Set the default timezone to Beijing
moment.tz.setDefault("Asia/Shanghai");


// 数据库文件名
const dbFile = 'chats.db';

// 创建数据库连接
let db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('连接聊天记录数据库');
        db.run(`
          CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),  -- Use STRFTIME for timestamps
            name TEXT,
            message TEXT
          )
        `);
    }
});



// 日志记录函数
export function chat(name, message) {

    // Limit message length to 200 characters
    // if(!message) return
    // const truncatedMessage = message.substring(0, 200);

    const timestamp = moment().format("YYYY-MM-DD HH:mm"); // Format timestamp with Beijing time
    db.run(`INSERT INTO chats (timestamp, name, message) VALUES (?, ?, ?)`, [timestamp, name, message], function (err) {
        if (err) {
            console.error(err.message);
        } 
    });


    // Keep only the latest 200 log entries
    db.run(`DELETE FROM chats WHERE id NOT IN (SELECT id FROM logs ORDER BY id DESC LIMIT 200)`);


}



// 查询日志
export function getChats() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM chats ORDER BY timestamp DESC`, [], (err, rows) => {  
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}