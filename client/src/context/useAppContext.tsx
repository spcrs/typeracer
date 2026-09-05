import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types';

export interface AppContextType {
  nickname: string;
  setNickname: (name: string) => void;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  isConnected: boolean;
  currentScreen: 'nickname' | 'home' | 'solo' | 'team';
  setCurrentScreen: (screen: 'nickname' | 'home' | 'solo' | 'team') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};