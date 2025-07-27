import { useState, useEffect } from 'react';
import eyeIcon from '../assets/icons/eye.png';
import eyeSlashIcon from '../assets/icons/eye_slash.png';
import lockIcon from '../assets/icons/lock.png';
import userIcon from '../assets/icons/user_auth_icon.png';
import './AuthScreen.css';
import { register } from '../utils/supabase/authService';
import { supabase } from '../utils/supabase/supabaseClient';
import axios from 'axios';

const initialState = {
  login: '',
  password: '',
};

    const fetchUsers = async () => {
      const { data, error } = await supabase.functions.invoke('getSyncvkUsers');
      if (error) {
        console.error('Ошибка получения пользователей:', error);
      } else {
        console.log('Пользователи:', data.users);
      }
    };

export default function AuthScreen({accessAuth}) {
  const [form, setForm] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy error simulation
    if (
      form.login !== 'admin' ||
      form.password !== 'admin'
    ) {
      setError(true);
      setForm((prev) => ({
        ...prev,
        login: '',
        password: '',
      }));
      return;
    }
    // Success logic
    accessAuth();
  };

  const handleToggleMode = () => {
    setIsRegister((prev) => !prev);
    setError(false);
    setForm(initialState);
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  
  const handleRegister = async () => {
    // const result = await register(form.login, form.password);
    const { login: username, password } = form;
//     const result = await fetch("https://wjczmkjsfvadutsutcck.supabase.co/functions/v1/registerUser", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ username, password }),
// })  

// const { data, error } = await supabase.functions.invoke('registerUser', {
//   body: { name: 'Functions' },
// })
// console.log('Function response:', data, error);

  //   const result = await register(username, password);
  // console.log('Registration result:', result);
  
    
    // if (result.error) {
    //   console.error('Ошибка регистрации:', result.error);
    // } else {
    //   console.log('Успешно зарегистрирован:', result.data);
    // }
//     const options = {method: 'GET', url: 'https://panel.syncvk.com/api/users'};

// try {
//   const { data } = await axios.request(options);
//   console.log(data);
// } catch (error) {
//   console.error(error);
// }
fetchUsers()
  };

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     const { data, error } = await supabase.functions.invoke('getSyncvkUsers');
  //     if (error) {
  //       console.error('Ошибка получения пользователей:', error);
  //     } else {
  //       console.log('Пользователи:', data.users);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  const loginPlaceholder = error ? 'Такой логин не найден' : 'Введите ваш логин';
  const loginLabelClass = error ? 'auth_label error' : 'auth_label';
  const inputClass = error ? 'auth_input error' : 'auth_input';

  return (
    <div className='auth_screen'>
      <div className='auth_container'>
        <form className='auth_form' onSubmit={handleSubmit}>
          <h1>{isRegister ? 'Регистрация ВКоннекте' : 'Войти ВКоннекте'}</h1>
          <div className='auth_field'>
            <label className={loginLabelClass}>Логин</label>
            <div className='auth_input_wrapper'>
              <img src={userIcon} alt='user' className='auth_icon' />
              <input
                type='text'
                name='login'
                className={inputClass}
                placeholder={loginPlaceholder}
                value={form.login}
                onChange={handleChange}
                style={error ? { color: 'red', borderColor: 'red' } : {}}
                // autoComplete='username'
              />
            </div>
          </div>
          <div className='auth_field'>
            <label className={loginLabelClass}>Пароль</label>
            <div className='auth_input_wrapper'>
              <img src={lockIcon} alt='lock' className='auth_icon' />
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                className={inputClass}
                placeholder={'******'}
                value={
                  showPassword ? form.password : error ? '' : form.password
                }
                onChange={handleChange}
                style={error ? { color: 'red', borderColor: 'red' } : {}}
                // autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type='button'
                className='auth_eye_btn'
                onClick={handleTogglePassword}
                tabIndex={-1}
              >
                <img
                  src={showPassword ? eyeIcon : eyeSlashIcon}
                  alt='toggle password'
                  className='auth_eye_icon'
                />
              </button>
            </div>
          </div>
          <button className='auth_btn' type='submit' onClick={() => isRegister ? handleRegister() : handleSubmit()}>
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
          <div className='auth_divider'>
            <span className='auth_line' />
            <span className='auth_or'>Или</span>
            <span className='auth_line' />
          </div>
          <div className='auth_switch'>
            <span>
              {isRegister ? 'Уже есть аккаунт?' : 'Еще нет аккаунта?'}
            </span>
            <button
              type='button'
              className='auth_link'
              onClick={handleToggleMode}
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
          <button className='auth_telegram_btn' type='button'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='25'
              height='25'
              viewBox='0 0 25 25'
              fill='none'
            >
              <path
                d='M12.5 2.8432C6.98 2.8432 2.5 7.3232 2.5 12.8432C2.5 18.3632 6.98 22.8432 12.5 22.8432C18.02 22.8432 22.5 18.3632 22.5 12.8432C22.5 7.3232 18.02 2.8432 12.5 2.8432ZM17.14 9.6432C16.99 11.2232 16.34 15.0632 16.01 16.8332C15.87 17.5832 15.59 17.8332 15.33 17.8632C14.75 17.9132 14.31 17.4832 13.75 17.1132C12.87 16.5332 12.37 16.1732 11.52 15.6132C10.53 14.9632 11.17 14.6032 11.74 14.0232C11.89 13.8732 14.45 11.5432 14.5 11.3332C14.5069 11.3014 14.506 11.2684 14.4973 11.237C14.4886 11.2056 14.4724 11.1769 14.45 11.1532C14.39 11.1032 14.31 11.1232 14.24 11.1332C14.15 11.1532 12.75 12.0832 10.02 13.9232C9.62 14.1932 9.26 14.3332 8.94 14.3232C8.58 14.3132 7.9 14.1232 7.39 13.9532C6.76 13.7532 6.27 13.6432 6.31 13.2932C6.33 13.1132 6.58 12.9332 7.05 12.7432C9.97 11.4732 11.91 10.6332 12.88 10.2332C15.66 9.0732 16.23 8.8732 16.61 8.8732C16.69 8.8732 16.88 8.8932 17 8.9932C17.1 9.0732 17.13 9.1832 17.14 9.2632C17.13 9.3232 17.15 9.5032 17.14 9.6432Z'
                fill='white'
              />
            </svg>
            {isRegister ? 'Зарегистрироваться' : 'Войти'} через Telegram
          </button>
        </form>
      </div>
      <div className='auth_side_image'></div>
    </div>
  );
}
