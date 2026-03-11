import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('app.db'); // database file inside app sandbox

export async function initUsers() {
  await db.execAsync(
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
}

export async function insertUser(u: {
  id: string; email: string; username?: string; password: string;
  name?: string; grade?: string; chapter?: string;
}): Promise<void> {
  await db.runAsync(
    `INSERT INTO users (id,email,username,password,name,grade,chapter)
     VALUES (?,?,?,?,?,?,?)`,
    [u.id, u.email, u.username || null, u.password, u.name || null, u.grade || null, u.chapter || null]
  );
}

export async function getUserByIdentifier(identifier: string, password: string): Promise<any | null> {
  const idLower = identifier.toLowerCase();
  const result = await db.getFirstAsync(
    `SELECT * FROM users WHERE (lower(email)=? OR lower(username)=?) AND password=? LIMIT 1`,
    [idLower, idLower, password]
  );
  return result || null;
}

export async function emailOrUsernameExists(email: string, username?: string): Promise<{ email: boolean; username: boolean }> {
  const result = await db.getFirstAsync<{ emailHit: number; userHit: number }>(
    `SELECT 
      SUM(CASE WHEN lower(email)=? THEN 1 ELSE 0 END) as emailHit,
      SUM(CASE WHEN lower(username)=? AND username IS NOT NULL THEN 1 ELSE 0 END) as userHit
     FROM users`,
    [email.toLowerCase(), (username || '').toLowerCase()]
  );
  return { 
    email: result ? result.emailHit > 0 : false, 
    username: result ? result.userHit > 0 : false 
  };
}