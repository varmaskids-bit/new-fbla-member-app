import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertUser, emailOrUsernameExists, initUsers } from './userStore';

const AS_KEY = 'fbla:auth:v1';
const MIGRATION_FLAG = 'fbla:migrated:v1';

type User = {
  id: string;
  email: string;
  password: string;
  username?: string;
  name?: string;
  grade?: string;
  chapter?: string;
};

export async function migrateAsyncStorageToSQLite(opts?: { clearAfter?: boolean }) {
  await initUsers();
  const already = await AsyncStorage.getItem(MIGRATION_FLAG);
  if (already === 'done') return { migrated: 0, skipped: 0, already: true };

  const raw = await AsyncStorage.getItem(AS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(MIGRATION_FLAG, 'done');
    return { migrated: 0, skipped: 0 };
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    await AsyncStorage.setItem(MIGRATION_FLAG, 'done');
    return { migrated: 0, skipped: 0 };
  }

  const usersObj = (data && typeof data === 'object' && data.users) || {};
  const users: User[] = Object.values(usersObj);

  let migrated = 0;
  let skipped = 0;

  for (const u of users) {
    try {
      const exists = await emailOrUsernameExists(u.email, u.username);
      if (exists.email || exists.username) {
        skipped++;
        continue;
      }
      await insertUser({
        id: u.id,
        email: u.email,
        username: u.username,
        password: u.password,
        name: u.name,
        grade: u.grade,
        chapter: u.chapter,
      });
      migrated++;
    } catch {
      skipped++;
    }
  }

  await AsyncStorage.setItem(MIGRATION_FLAG, 'done');
  if (opts?.clearAfter) {
    // Optional: remove legacy blob
    await AsyncStorage.removeItem(AS_KEY);
  }

  return { migrated, skipped };
}