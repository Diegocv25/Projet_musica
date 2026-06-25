import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppUser = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  familyId: string;
};

const USERS_KEY = "soundwave:usuarios";
const SESSION_KEY = "soundwave:sessao";
const FAMILY_ID_FIXO = "familia-diego-001";

async function getUsers(): Promise<AppUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as AppUser[];
}

async function setUsers(users: AppUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(nome: string, email: string, senha: string) {
  const users = await getUsers();
  const lowerEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === lowerEmail)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  const user: AppUser = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nome: nome.trim(),
    email: lowerEmail,
    senha,
    familyId: FAMILY_ID_FIXO,
  };

  await setUsers([...users, user]);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function loginUser(email: string, senha: string) {
  const users = await getUsers();
  const lowerEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === lowerEmail && u.senha === senha);
  if (!user) throw new Error("E-mail ou senha inválidos.");
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function seedDefaultUser() {
  const users = await getUsers();
  if (users.length > 0) return;
  const padrao: AppUser = {
    id: "usuario-geral-1",
    nome: "Família",
    email: "familia@soundwave.app",
    senha: "123456",
    familyId: FAMILY_ID_FIXO,
  };
  await setUsers([padrao]);
}
