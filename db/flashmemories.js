import sqlite3 from 'sqlite3';
import moment from 'moment-timezone';

moment.tz.setDefault("Asia/Shanghai");

const dbFile = 'flashmemories.db';

const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { 
    if (err) {
        console.error('Error opening database:', err.message); 
    } else {
        console.log('连接记忆数据库成功');
        db.run(`
            CREATE TABLE IF NOT EXISTS flashmemories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,  -- Store timestamp as TEXT for simplicity
                talkid TEXT,
                content TEXT,
                type TEXT
            )
        `, (err) => { 
            if (err) {
                console.error("Error creating flashmemories table:", err.message);
            }
        });
    }
});


// 记录记忆
export function saveFlashMemory(talkid, content,type) {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss"); 
    db.serialize(() => {  
        db.run(`INSERT INTO flashmemories (timestamp, talkid, content,type) VALUES (?, ?, ?, ?)`, [timestamp, talkid, content,type], (err) => {
            if (err) {
                console.error('Error inserting memory:', err.message);
            }
        });
    });
}

// 根据talkid查询记忆
export function getFlashMemory(talkid) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM flashmemories WHERE talkid = ?`, [talkid], (err, row) => { 
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}


// 查询全部记忆
export function getFlashMemories() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM flashmemories ORDER BY timestamp DESC`, [], (err, rows) => { 
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// 根据talkid删除记忆
export function deleteFlashMemory(talkid) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM flashmemories WHERE talkid = ?`, [talkid], function(err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve({message: '日志已删除'}); // Resolve with a success message
            }
        });
    });
}

// 删除所有记忆
export function deleteFlashMemories() {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM flashmemories`, [], function(err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve({message: '所有日志已删除'}); // Resolve with a success message
            }
        });
    });
}