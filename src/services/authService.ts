import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import type { User } from '@/types/user';

/**
 * A local, AsyncStorage-backed stand-in for an auth API.
 *
 * Registered users are stored as a map keyed by email, with passwords
 * salted and hashed (SHA-256) so plain-text passwords never touch disk.
 * The active session is stored separately so it survives app restarts.
 */

const USERS_KEY = '@kloudius/users';
const SESSION_KEY = '@kloudius/session';
const SIMULATED_LATENCY_MS = 600;

type StoredUser = User & {
  passwordHash: string;
  salt: string;
};

type UserMap = Record<string, StoredUser>;

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_CREDENTIALS' | 'EMAIL_IN_USE',
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function readUsers(): Promise<UserMap> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as UserMap) : {};
}

async function writeUsers(users: UserMap): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser({ passwordHash: _hash, salt: _salt, ...user }: StoredUser): User {
  return user;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  await delay(SIMULATED_LATENCY_MS);

  const users = await readUsers();
  const key = normalizeEmail(email);

  if (users[key]) {
    throw new AuthError('An account with this email already exists.', 'EMAIL_IN_USE');
  }

  const salt = Crypto.randomUUID();
  const stored: StoredUser = {
    id: Crypto.randomUUID(),
    name: name.trim(),
    email: key,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: await hashPassword(password, salt),
  };

  await writeUsers({ ...users, [key]: stored });

  const user = toPublicUser(stored);
  await saveSession(user);
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  await delay(SIMULATED_LATENCY_MS);

  const users = await readUsers();
  const stored = users[normalizeEmail(email)];

  // Same message for unknown email and wrong password, so we don't leak which accounts exist.
  if (!stored || (await hashPassword(password, stored.salt)) !== stored.passwordHash) {
    throw new AuthError('Incorrect email or password.', 'INVALID_CREDENTIALS');
  }

  const user = toPublicUser(stored);
  await saveSession(user);
  return user;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getSession(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

async function saveSession(user: User): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
