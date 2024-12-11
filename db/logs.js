import sqlite3 from 'sqlite3';
import moment from 'moment-timezone'; // Import moment-timezone for timezones

// Set the default timezone to Beijing
moment.tz.setDefault("Asia/Shanghai");


// 数据库文件名
const dbFile = 'logs.db';

// 创建数据库连接
let db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('连接日志数据库');
        // 创建日志表（如果不存在）
        db.run(`
          CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),  -- Use STRFTIME for timestamps
            level TEXT,
            message TEXT
          )
        `);
    }
});



// 日志记录函数
export function log(level, message) {

    // Limit message length to 200 characters
    // if(!message) return
    // const truncatedMessage = message.substring(0, 200);

    const timestamp = moment().format("YYYY-MM-DD HH:mm"); // Format timestamp with Beijing time
    db.run(`INSERT INTO logs (timestamp, level, message) VALUES (?, ?, ?)`, [timestamp, level, message], function (err) {
        if (err) {
            console.error(err.message);
        } 
    });


    // Keep only the latest 200 log entries
    db.run(`DELETE FROM logs WHERE id NOT IN (SELECT id FROM logs ORDER BY id DESC LIMIT 200)`);


}



// 查询日志
export function getLogs() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM logs ORDER BY timestamp DESC`, [], (err, rows) => {  // Order by timestamp descending
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}