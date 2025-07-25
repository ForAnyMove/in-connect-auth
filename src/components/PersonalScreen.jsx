import { useState } from 'react';
import userIcon from '../assets/icons/user.png';
import copyIcon from '../assets/icons/copy.png';
import calendarIcon from '../assets/icons/calendar.png';
import plusIcon from '../assets/icons/plus.png';
import keyIcon from '../assets/icons/key.png';
import shieldIcon from '../assets/icons/shield.png';
import refreshKeyIcon from '../assets/icons/refresh-key.png';
import changeDeviceIcon from '../assets/icons/change-device.png';
import crossRedIcon from '../assets/icons/cross-red.png';
import appStoreIcon from '../assets/icons/app-store-icon.png';
import googlePlayIcon from '../assets/icons/google-play-icon.png';
import crossBlackIcon from '../assets/icons/cross-black.png';
import checkIcon from '../assets/icons/check.png';
import './PersonalScreen.css';

export default function PersonalScreen() {
  const [modal, setModal] = useState(null);
  const [days, setDays] = useState(30);

  const handleCopy = () => navigator.clipboard.writeText('42GJ4C');
  const closeModal = () => setModal(null);

  const renderModal = () => (
    <div className='modal_overlay'>
      <div className='modal_window'>
        <img
          src={
            modal === 'extend'
              ? plusIcon
              : modal === 'refresh'
              ? refreshKeyIcon
              : modal === 'change'
              ? changeDeviceIcon
              : crossRedIcon
          }
          alt='modal icon'
          className='modal_icon'
        />
        <h2 className='modal_title'>
          {modal === 'extend'
            ? 'Продлить доступ'
            : modal === 'refresh'
            ? 'Перевыпустить ключ?'
            : modal === 'change'
            ? 'Заменить устройство?'
            : 'Удалить ключ?'}
        </h2>
        <p className='modal_subtext'>
          {modal === 'extend'
            ? 'Укажите количество дней, на которое хотите продлить доступ.'
            : 'После сброса войдите с вашим ID на новом устройстве, чтобы завершить привязку'}
        </p>

        {modal === 'extend' && (
          <div className='days_input'>
            <button onClick={() => setDays(Math.max(1, days - 1))}>-</button>
            <span>{days}</span>
            <button onClick={() => setDays(days + 1)}>+</button>
          </div>
        )}

        <div className='modal_actions'>
          <button className='modal_btn gray' onClick={closeModal}>
            <img src={crossBlackIcon} alt='no' /> Нет
          </button>
          <button className='modal_btn yellow' onClick={() => {}}>
            <img src={checkIcon} alt='yes' /> Да, хочу
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='personal_screen'>
      <h1 className='personal_title'>Личный кабинет</h1>

      <div className='personal_container'>
        <div className='personal_block full'>
          <div className='personal_header'>
            <img className='personal_icon' src={userIcon} alt='ID' />
            <span>Ваш ID</span>
          </div>
          <div className='personal_content'>
            <span className='personal_code'>42GJ4C</span>
            <img
              src={copyIcon}
              alt='copy'
              className='copy-icon clickable'
              onClick={handleCopy}
            />
          </div>
        </div>

        <div className='personal_block full column'>
          <div className='personal_block-column'>
            <div className='personal_header'>
              <img
                className='personal_icon'
                src={calendarIcon}
                alt='calendar'
              />
              <span>Кол-во дней</span>
            </div>
            <div className='personal_content spaced'>
              <span>32 дня</span>
            </div>
          </div>
          <button className='extend_btn' onClick={() => setModal('extend')}>
            <span>Продлить</span> <img src={plusIcon} alt='plus' />
          </button>
        </div>

        <div className='personal_block wide-short'>
          <div className='personal_header'>
            <img className='personal_icon' src={keyIcon} alt='key' />
            <span>Состояние ключа</span>
          </div>
          <div className='personal_content'>
            Активен
            <img src={shieldIcon} alt='shield' />
          </div>
        </div>

        <div className='personal_block wide-long' onClick={() => setModal('refresh')}>
          <div className='personal_header'>
            <img className='personal_icon' src={refreshKeyIcon} alt='refresh' />
          </div>
          <div className='personal_content'>Перевыпуск ключа</div>
        </div>

        <div className='personal_block wide-long' onClick={() => setModal('change')}>
          <div className='personal_header'>
            <img
              className='personal_icon'
              src={changeDeviceIcon}
              alt='change'
            />
          </div>
          <div className='personal_content'>Заменить устройство</div>
        </div>

        <div
          className='personal_block wide-short delete_block'
          onClick={() => setModal('delete')}
        >
          <div className='personal_header'>
            <img className='personal_icon' src={crossRedIcon} alt='delete' />
          </div>
          <div className='personal_content'>Удалить ключ</div>
        </div>

        <div className='personal_block wide store'>
          <img src={appStoreIcon} alt='AppStore' className='store_icon' />
          <span>Скачать в AppStore</span>
        </div>

        <div className='personal_block wide store'>
          <img src={googlePlayIcon} alt='GooglePlay' className='store_icon' />
          <span>Скачать в Google Play</span>
        </div>
      </div>

      {modal && renderModal()}
    </div>
  );
}
