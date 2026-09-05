import React, { useState, useEffect, type ReactNode } from 'react';
import { socket } from '../socket';
import { AppContext } from './useAppContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nickname, setNicknameState] = useState<string>(() => {
    return localStorage.getItem('typeracer_nickname') || '';
  });
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [currentScreen, setCurrentScreen] = useState<'nickname' | 'home' | 'solo' | 'team'>(
    nickname ? 'home' : 'nickname'
  );

  const setNickname = (name: string) => {
    setNicknameState(name);
    if (name) {
      localStorage.setItem('typeracer_nickname', name);
    } else {
      localStorage.removeItem('typeracer_nickname');
    }
  };

  useEffect(() => {
    socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        nickname,
        setNickname,
        socket,
        isConnected,
        currentScreen,
        setCurrentScreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};