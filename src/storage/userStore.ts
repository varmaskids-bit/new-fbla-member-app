import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('app.db'); // database file inside app sandbox

export function initUsers() {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        password TEXT NOT NULL,
        name TEXT,
        grade TEXT,
        chapter TEXT
      );`
    );
  });
}

export function insertUser(u: {
  id: string; email: string; username?: string; password: string;
  name?: string; grade?: string; chapter?: string;
}): Promise<void> {
  return new Promise((res, rej) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO users (id,email,username,password,name,grade,chapter)
         VALUES (?,?,?,?,?,?,?)`,
        [u.id, u.email, u.username || null, u.password, u.name || null, u.grade || null, u.chapter || null],
        () => res(),
        (_, err) => { rej(err); return false; }
      );
    });
  });
}

export function getUserByIdentifier(identifier: string, password: string): Promise<any | null> {
  const idLower = identifier.toLowerCase();
  return new Promise((res) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM users WHERE (lower(email)=? OR lower(username)=?) AND password=? LIMIT 1`,
        [idLower, idLower, password],
        (_, { rows }) => res(rows.length ? rows.item(0) : null),
        () => { res(null); return false; }
      );
    });
  });
}

export function emailOrUsernameExists(email: string, username?: string): Promise<{ email: boolean; username: boolean }> {
  return new Promise((res) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT 
          SUM(CASE WHEN lower(email)=? THEN 1 ELSE 0 END) AS emailHit,
          SUM(CASE WHEN ?!='' AND lower(username)=? THEN 1 ELSE 0 END) AS userHit
         FROM users`,
        [email.toLowerCase(), (username||'').toLowerCase(), (username||'').toLowerCase()],
        (_, { rows }) => {
          const r = rows.item(0);
          res({ email: r.emailHit > 0, username: r.userHit > 0 });
        },
        () => { res({ email: false, username: false }); return false; }
      );
    });
  });
}