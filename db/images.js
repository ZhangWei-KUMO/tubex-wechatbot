import sqlite3 from 'sqlite3';
import moment from 'moment-timezone';

moment.tz.setDefault("Asia/Shanghai");

const dbFile = 'images.db';

const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => { 
    if (err) {
        console.error('Error opening database:', err.message); 
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,  -- Store timestamp as TEXT for simplicity
                title TEXT,
                content TEXT,
                type TEXT
            )
        `, (err) => { 
            if (err) {
                console.error("Error creating images table:", err.message);
            }
        });
    }
});


// 存储图片
export function saveImage(config) {
    return new Promise((resolve, reject) => {
      const { title, content, type } = config;
      const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  
      db.serialize(() => {
        db.run(
          `INSERT INTO images (timestamp, title, content,type) VALUES (?, ?, ?, ?)`,
          [timestamp, title, content, type],
          (err) => {
            if (err) {
              console.error("Error inserting image:", err.message);
              reject(err); // Reject the promise on error
            } else {
              resolve();  // Resolve the promise on successful insertion
            }
          }
        );
      });
    });
  }

// 根据id查询记忆
export function getImage(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM images WHERE id = ?`, [id], (err, row) => { 
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}


// 查询全部图片
export function getImages() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM images ORDER BY timestamp DESC`, [], (err, rows) => { 
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// 根据id删除图片
export function deleteImage(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM images WHERE id = ?`, [id], function(err) {
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
export function deleteImages() {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM images`, [], function(err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve({message: '所有日志已删除'}); // Resolve with a success message
            }
        });
    });
}