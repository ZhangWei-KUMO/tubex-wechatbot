import sqlite3 from 'sqlite3';
import moment from 'moment-timezone';

moment.tz.setDefault("Asia/Shanghai");

const dbFile = 'logs.db';

const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { 
    if (err) {
        console.error('Error opening database:', err.message); 
    } else {
        console.log('连接日志数据库成功');
        // Create the logs table
        db.run(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,  -- Store timestamp as TEXT for simplicity
                level TEXT,
                message TEXT
            )
        `, (err) => {  // Handle table creation errors
            if (err) {
                console.error("Error creating logs table:", err.message);
            }
        });
    }
});


// 记录日志
export function log(level, message) {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss"); // Add seconds
    db.serialize(() => {  // Ensure operations are executed in order
        db.run(`INSERT INTO logs (timestamp, level, message) VALUES (?, ?, ?)`, [timestamp, level, message], (err) => {
            if (err) {
                console.error('Error inserting log:', err.message); // Log insertion errors
            }
        });
    });
}


// 查询日志
export function getLogs() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM logs ORDER BY timestamp DESC`, [], (err, rows) => {  // Order by timestamp descending
            if (err) {
                console.error("触发错误");
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// 删除所有日志
export function deleteLogs() {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM logs`, [], function(err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve({message: '所有日志已删除'}); // Resolve with a success message
            }
        });
    });
}