import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import PersonalScreen from './components/PersonalScreen';
import AuthScreen from './components/AuthScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  return (
    <>
      <Header />
      {isAuthenticated ? (
        <PersonalScreen />
      ) : (
        <AuthScreen />
      )}
    </>
  );
}

export default App;
