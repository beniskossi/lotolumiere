import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface OfflineData {
  draws: any[];
  predictions: any[];
  favorites: any[];
  lastSync: string;
}

export const useOfflineData = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les données hors ligne au démarrage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('loto-lumiere-offline');
      if (cached) {
        const data = JSON.parse(cached);
        setOfflineData(data);
      }
    } catch (error) {
      console.error('Erreur chargement données offline:', error);
    }
  };

  const saveOfflineData = (data: Partial<OfflineData>) => {
    try {
      const current = offlineData || { draws: [], predictions: [], favorites: [], lastSync: '' };
      const updated = { ...current, ...data, lastSync: new Date().toISOString() };
      
      localStorage.setItem('loto-lumiere-offline', JSON.stringify(updated));
      setOfflineData(updated);
    } catch (error) {
      console.error('Erreur sauvegarde données offline:', error);
    }
  };

  const syncWithServer = async () => {
    if (!isOnline) return false;

    try {
      // Synchroniser les données avec le serveur
      // Ici vous pouvez implémenter la logique de sync
      
      // Invalider les caches pour forcer le rechargement
      queryClient.invalidateQueries();
      
      return true;
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      return false;
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('loto-lumiere-offline');
    setOfflineData(null);
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    syncWithServer,
    clearOfflineData,
    hasOfflineData: !!offlineData
  };
};

// Hook pour les requêtes avec fallback offline
export const useOfflineQuery = (
  queryKey: string[],
  queryFn: () => Promise<any>,
  offlineKey?: string
) => {
  const { isOnline, offlineData } = useOfflineData();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isOnline) {
        return await queryFn();
      } else if (offlineData && offlineKey) {
        // Retourner les données offline si disponibles
        return offlineData[offlineKey as keyof OfflineData] || [];
      }
      throw new Error('Pas de connexion et pas de données offline');
    },
    staleTime: isOnline ? 1000 * 60 * 5 : Infinity, // 5 min online, infini offline
    retry: isOnline ? 3 : 0,
  });
};