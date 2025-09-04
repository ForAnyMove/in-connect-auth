import { useState, useEffect } from 'react';
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
import { supabase } from '../utils/supabase/supabaseClient';

function hoursWordFixer(hours) {
  if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100))
    return 'часа';
  return 'часов';
}

function daysWordFixer(days) {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100))
    return 'дня';
  return 'дней';
}

export default function PersonalScreen({ user, setUser }) {
  const [availableDays, setAvailableDays] = useState('0 дней');
  const [timeExpired, setTimeExpired] = useState(false);

  const [modal, setModal] = useState(null);
  const [days, setDays] = useState(30);

  const handleCopy = () =>
    navigator.clipboard.writeText(user?.code || 'Нет ID');
  const closeModal = () => setModal(null);

  const isUserDataMissing = !user?.user_API_data;
  const isDisabled = user?.user_API_data?.status === 'DISABLED';

  useEffect(() => {
    const getTimeLeft = async () => {
      const { data, error } = await supabase.functions.invoke('getTimeLeft', {
        body: { name: 'Functions', expiresAt: user?.user_API_data?.expireAt },
      });

      if (error) {
        console.error('Ошибка при вызове функции:', error);
      } else {
        console.log('Ответ от функции:', data);
        setTimeExpired(data.timeLeft <= 0);
        setAvailableDays(
          data.isHours
            ? `${data.timeLeft} ${hoursWordFixer(data.timeLeft)}`
            : `${data.timeLeft} ${daysWordFixer(data.timeLeft)}`
        );
      }
    };
    getTimeLeft();
  }, [user?.user_API_data?.expireAt]);

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
              : modal === 'create'
              ? checkIcon
              : crossRedIcon
          }
          alt='modal icon'
          className='modal_icon'
        />
        <h2 className='modal_title'>
          {modal === 'extend'
            ? 'Продлить доступ'
            : modal === 'refresh'
            ? 'Вы точно хотите перевыпустить ключ?'
            : modal === 'change'
            ? 'Вы точно хотите заменить устройство?'
            : modal === 'create'
            ? 'Вы точно хотите создать новый ключ?' 
            : 'Вы точно хотите удалить ключ?'}
        </h2>
        <p className='modal_subtext'>
          {modal === 'extend'
            ? 'Укажите количество дней, на которое хотите продлить доступ.'
            : modal === 'refresh'
            ? 'После применения ключ будет пересоздан, и вы сможете продолжить использовать его.'
            : modal === 'change'
            ? 'После сброса войдите с вашим ID на новом устройстве, чтобы завершить привязку'
            : modal === 'create'
            ? 'После создания ключа вы сможете использовать его на новом устройстве.'
            : 'После удаления ключа вы не сможете использовать его на этом устройстве.'}
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
          <button
            className='modal_btn yellow'
            onClick={() => acceptModalTriggerByType(modal)}
          >
            <img src={checkIcon} alt='yes' /> Да, хочу
          </button>
        </div>
      </div>
    </div>
  );

  function acceptModalTriggerByType(type) {
    switch (type) {
      case 'extend':
        return null; // Здесь должна быть логика продления доступа
      case 'refresh':
        // Здесь должна быть логика перевыпуска ключа
        supabase.functions.invoke('refreshKey').then(({ data, error }) => {
          if (error) {
            console.error('Ошибка перевыпуска ключа:', error);
          } else {
            console.log('Ключ успешно перевыпущен:', data);
            setUser(data.user);
            closeModal();
          }
        });
        return;
      case 'change':
        supabase.functions.invoke('resetDevice', {
          body: { id: user?.id }}).then(({ data, error }) => {
          if (error) {
            console.error('Ошибка сброса устройства:', error);
          } else {
            console.log('Устройство успешно сброшено:', data);
            closeModal();
          }
        });
        return;
      case 'delete':
        // Здесь должна быть логика перевыпуска ключа
        supabase.functions
          .invoke('deleteKey', {
            body: { id: user?.id },
          })
          .then(({ data, error }) => {
            if (error) {
              console.error('Ошибка удаления ключа:', error);
            } else {
              console.log('Ключ успешно удален:', data);
              setUser(data.user);
              closeModal();
            }
          });
        return;
      case 'create':
        // Здесь должна быть логика перевыпуска ключа
        supabase.functions
          .invoke('recreateKey', {
            body: { id: user?.id },
          })
          .then(({ data, error }) => {
            if (error) {
              console.error('Ошибка создания ключа:', error);
            } else {
              console.log('Ключ успешно создан:', data);
              setUser(data.user);
              closeModal();
            }
          });
        return;
      default:
        return null;
    }
  }

  const renderKeyStatus = () => {
    if (isUserDataMissing)
      return <div className='personal_content red'>Ошибка</div>;
    if (isDisabled)
      return <div className='personal_content red'>Заблокирован</div>;
    if (timeExpired)
      return <div className='personal_content red'>Просрочен</div>;
    return (
      <div className='personal_content'>
        Активен
        <img src={shieldIcon} className='shield' alt='shield' />
      </div>
    );
  };

  const renderExtendButton = () => {
    if (isUserDataMissing)
      return (
        <a
          className='extend_btn gray'
          href='https://t.me/inConnect_support_bot'
          target='_blank'
          rel='noopener noreferrer'
        >
          <span>Обратиться в поддержку</span>
          {/* <img src={plusIcon} alt="plus" /> */}
        </a>
      );

    return (
      <button
        className={`extend_btn ${isDisabled ? 'gray' : ''}`}
        onClick={() => {
          if (!isDisabled) setModal('extend');
        }}
      >
        <span>Продлить</span>
        <img src={plusIcon} alt='plus' />
      </button>
    );
  };

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
            <span className='personal_code'>{user?.code}</span>
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
              <span>{availableDays}</span>
            </div>
          </div>
          {/* <button className='extend_btn' onClick={() => setModal('extend')}>
            <span>Продлить</span> <img src={plusIcon} alt='plus' />
          </button> */}
          {renderExtendButton()}
        </div>

        <div className='personal_block wide-short'>
          <div className='personal_header'>
            <img className='personal_icon' src={keyIcon} alt='key' />
            <span>Состояние ключа</span>
          </div>
          {/* <div className='personal_content'>
            {user?.user_API_data?.status === 'ACTIVE' ? 'Активен' : 'Неактивен'}
            <img src={shieldIcon} alt='shield' />
          </div> */}
          {renderKeyStatus()}
        </div>

        <div
          className='personal_block wide-long'
          onClick={() => setModal('refresh')}
        >
          <div className='personal_header'>
            <img className='personal_icon' src={refreshKeyIcon} alt='refresh' />
          </div>
          <div className='personal_content'>Перевыпуск ключа</div>
        </div>

        <div
          className='personal_block wide-long'
          onClick={() => setModal('change')}
        >
          <div className='personal_header'>
            <img
              className='personal_icon'
              src={changeDeviceIcon}
              alt='change'
            />
          </div>
          <div className='personal_content'>Заменить устройство</div>
        </div>
        {user?.isVKSync ? (
          <div
            className='personal_block wide-short delete_block'
            onClick={() => setModal('delete')}
          >
            <div className='personal_header'>
              <img className='personal_icon' src={crossRedIcon} alt='delete' />
            </div>
            <div className='personal_content'>Удалить ключ</div>
          </div>
        ) : (
          <div
            className='personal_block wide-short delete_block'
            onClick={() => setModal('create')}
          >
            <div className='personal_header'>
              <img className='personal_icon' src={checkIcon} alt='delete' />
            </div>
            <div className='personal_content'>Создать ключ</div>
          </div>
        )}

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
