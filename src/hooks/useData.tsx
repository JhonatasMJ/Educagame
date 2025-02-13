import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../services/firebaseConfig';
import { User } from '../types/types';

export const useUserData = () => {
  const [userData, setUserData] = useState<User> ({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const db = getDatabase();
          const userRef = ref(db, 'users/' + auth.currentUser.uid);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            setError('Nenhum dado encontrado para este usuário.');
          }
        } catch (err) {
          setError('Erro ao buscar dados do usuário.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('Usuário não autenticado.');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, isLoading, error };
};