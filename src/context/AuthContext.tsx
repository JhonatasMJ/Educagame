// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../services/firebaseConfig';
import { User } from '../types/types';

interface AuthContextData {
  authUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}


const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true); // Adicionado para indicar que está carregando
      const db = getDatabase();
      const userRef = ref(db, 'users/' + uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setUserData(snapshot.val());
        setError(null);
      } else {
        setError('Nenhum dado encontrado para este usuário.');
        setUserData(null);
      }
    } catch (err) {
      setError('Erro ao buscar dados do usuário.');
      console.error(err);
      setUserData(null);
    } finally {
      setLoading(false); // Finaliza o carregamento independente do resultado
    }
  };

  const refreshUserData = async () => {
    if (authUser?.uid) {
      await fetchUserData(authUser.uid);
    }
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setAuthUser(user);

      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contextValue: AuthContextData = {
    authUser,
    userData,
    loading,
    error,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};