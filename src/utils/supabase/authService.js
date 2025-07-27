import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
import axios from 'axios';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

// export async function register(username, password) {
//   // Проверка формата username
//   const usernamePattern = /^[a-zA-Z0-9_-]{6,36}$/;
//   if (!usernamePattern.test(username)) {
//     return {
//       error: 'Username должен быть от 6 до 36 символов и содержать только латинские буквы, цифры, "_", "-"',
//     };
//   }

//   // Проверка, не занят ли username
//   const { data: existingUser } = await supabase
//     .from('users')
//     .select('id')
//     .eq('username', username)
//     .single();

//   if (existingUser) {
//     return { error: 'Такой username уже занят' };
//   }

//   // Хэширование пароля
//   const hashedPassword = bcrypt.hashSync(password, 10);

//   // Создание пользователя в Supabase
//   const { data: newUser, error: insertError } = await supabase
//     .from('users')
//     .insert([{ username, password_hash: hashedPassword }])
//     .select()
//     .single();

//   if (insertError || !newUser) {
//     console.log(insertError, 'Error creating user in Supabase');
//     console.log('New user data:', newUser);
    
    
//     return { error: 'Ошибка при создании пользователя в Supabase', detail: insertError };
//   }

//   // Сбор данных для API
//   const now = new Date();
//   const expireAt = new Date();
//   expireAt.setFullYear(expireAt.getFullYear() + 1); // +1 год

//   const payload = {
//     username: newUser.username,
//     status: 'ACTIVE',
//     shortUuid: newUser.code, // 6-значный код, сгенерированный на сервере
//     trojanPassword: generatePassword(),
//     vlessUuid: newUser.id, // UUID из Supabase
//     ssPassword: generatePassword(),
//     trafficLimitBytes: 0,
//     trafficLimitStrategy: 'NO_RESET',
//     expireAt: expireAt.toISOString(),
//     createdAt: now.toISOString(),
//   };
// const proxy = 'https://cors-anywhere.herokuapp.com/';
//   // Запрос к SyncVK API
//   const options = {
//     method: 'POST',
//     url: `${proxy}https://panel.syncvk.com/api/users`,
//     headers: { 'Content-Type': 'application/json' },
//     data: payload,
//   };

//   let apiResponse;
//   try {
//     const { data } = await axios.request(options);
//     apiResponse = data;
//   } catch (error) {
//     return { error: 'Ошибка при отправке в SyncVK API', detail: error?.response?.data || error.message };
//   }

//   if (!apiResponse?.response?.uuid) {
//     return { error: 'Некорректный ответ от SyncVK API', detail: apiResponse };
//   }

//   const syncvkUUID = apiResponse.response.uuid;

//   // Обновление пользователя в Supabase: сохранить syncvk_uuid
//   const { error: updateError } = await supabase
//     .from('users')
//     .update({ syncvk_uuid: syncvkUUID, isVKSync: true })
//     .eq('id', newUser.id);

//   if (updateError) {
//     return { error: 'UUID получен, но не удалось сохранить в Supabase', detail: updateError };
//   }

//   // Успешно — возвращаем пользователя из SyncVK API
//   return { data: apiResponse.response };
// }


export async function register(username, password) {
  // Проверка формата username
  const usernamePattern = /^[a-zA-Z0-9_-]{6,36}$/;
  if (!usernamePattern.test(username)) {
    return {
      error: 'Username должен быть от 6 до 36 символов и содержать только латинские буквы, цифры, "_", "-"',
    };
  }

  // Проверка, не занят ли username
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existingUser) {
    return { error: 'Такой username уже занят' };
  }

  // Хэширование пароля
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Создание пользователя в Supabase
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ username, password_hash: hashedPassword }])
    .select()
    .single();

  if (insertError || !newUser) {
    console.log(insertError, 'Error creating user in Supabase');
    console.log('New user data:', newUser);
    
    
    return { error: 'Ошибка при создании пользователя в Supabase', detail: insertError };
  }

  // Успешно — возвращаем пользователя из SyncVK API
  return { data: newUser };
}