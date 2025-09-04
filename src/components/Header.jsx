import './Header.css';
import mainLogo from '../assets/images/main_logo.png';
import home from '../assets/icons/home.png';
import support from '../assets/icons/support.png';
import refresh from '../assets/icons/refresh.png';
import download from '../assets/icons/download.png';
import profile from '../assets/icons/profile.png';
import { supabase } from '../utils/supabase/supabaseClient';

export default function Header({logOut}) {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Ошибка выхода:', error.message);
    } else {
      // Очисти локальное состояние, редирект и т.п.
      console.log('Вы вышли успешно');
      logOut();
    }
  };

  return (
    <header className='header'>
      <div className='logo-panel'>
        <div className='logo-container'>
          <img src={mainLogo} alt='' className='main_logo' />
        </div>
        <h1 className='logo-text'>Вконнекте</h1>
      </div>
      <nav className='nav-panel'>
        <ul className='nav-list'>
          <li className='nav-item'>
            <a href='#home'>
              <img src={home} alt='home' className='nav_icon' />
            </a>
          </li>
          <li className='nav-item'>
            <a href='#support'>
              <img src={support} alt='support' className='nav_icon' />
            </a>
          </li>
          <li className='nav-item'>
            <a href='#refresh'>
              <img src={refresh} alt='refresh' className='nav_icon' />
            </a>
          </li>
          <li className='nav-item'>
            <a href='#download'>
              <img src={download} alt='download' className='nav_icon' />
            </a>
          </li>
          <li className='nav-item active'onClick={() => handleLogout()}>
            <div>
              <img src={profile} alt='profile' className='nav_icon' />
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
