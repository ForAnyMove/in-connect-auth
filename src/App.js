import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import PersonalScreen from './components/PersonalScreen';
import AuthScreen from './components/AuthScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <>
      <Header
        logOut={() => {
          setUser(null);
          setIsAuthenticated(false);
        }}
      />
      {isAuthenticated ? (
        <PersonalScreen user={user} setUser={setUser} />
      ) : (
        <AuthScreen
          accessAuth={() => setIsAuthenticated(true)}
          authUser={setUser}
        />
      )}
    </>
  );
}

export default App;
