import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import PersonalScreen from './components/PersonalScreen';
import AuthScreen from './components/AuthScreen';
import { supabase } from './utils/supabase/supabaseClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([])

  useEffect(() => {
    async function getUsers() {
      const { data: users } = await supabase.from('users').select()
      console.log('Users:', users);
      
      if (users.length > 1) {
        setUsers(users)
      }
    }

    getUsers()
  }, [])
  
  return (
    <>
      <Header />
      {isAuthenticated ? (
        <PersonalScreen />
      ) : (
        <AuthScreen accessAuth={() => setIsAuthenticated(true)}/>
      )}
    </>
  );
}

export default App;
