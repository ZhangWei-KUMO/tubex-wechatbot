import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt'; //  引入 bcrypt 用于密码加密

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
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                level TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
              console.error("创建用户表失败:", err.message);
            } else {
              // 检查初始用户是否存在，如果不存在则创建
              db.get(`SELECT * FROM users WHERE username = 'admin'`, [], (err, row) => {
                  if (err) {
                      console.error("查询初始用户失败:", err.message);
                  } else if (!row) {
                      //  创建初始用户 admin，密码加密
                      bcrypt.hash('123456', 10, (err, hash) => {  //  使用 bcrypt 加密密码
                          if (err) {
                            console.error("密码加密失败:", err.message);
                          } else {
                              db.run(`INSERT INTO users (username, password, level) VALUES (?, ?, ?)`, ['admin', hash, 'admin'], (err) => {
                                if (err) {
                                  console.error("创建初始用户失败:", err.message);
                                } else {
                                  console.log("初始用户 admin 创建成功");
                                }
                              });
                          }
                        });
                    }
                });
            }

          });
    }
});



//  添加用户
export async function addUser(username, password, level) {
    return new Promise((resolve, reject) => {
        (async () => {
          try {
            const hashedPassword = await bcrypt.hash(password, 10); // 加密密码
            db.run('INSERT INTO users (username, password, level) VALUES (?, ?, ?)', [username, hashedPassword, level], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID); // 返回新用户的 ID
              }
            });
          } catch (error) {
            reject(error);
          }
        })();
      });
  }



//  获取所有用户
export function getUsers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }



//  更新用户信息
export async function updateUser(username, password, level) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          // 更新用户名和密码
          const hashedPassword = await bcrypt.hash(password, 10);
          db.run('UPDATE users SET password = ?, level = ? WHERE username = ?', [hashedPassword, level, username], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.changes); // 返回受影响的行数
            }
          });
        
        } catch (error) {
          reject(error);
        }
      })();
    });
  }


// 删除用户
export function deleteUser(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', id, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes); // Return the number of changed rows
        }
      });
    });
  }



// 验证用户登录
export async function verifyUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async function(err, row) {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null);  // 用户不存在
            } else {
                try {
                    const match = await bcrypt.compare(password, row.password);
                    if (match) {
                        resolve(row); //  密码匹配，返回用户信息
                    } else {
                        resolve(null); // 密码不匹配
                    }
                } catch (error) {
                    reject(error);  // bcrypt 比较出错
                }
            }
        });
    });

}