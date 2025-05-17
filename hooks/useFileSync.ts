// hooks/useFileSync.ts
import { useEffect, useState } from 'react';
import { fileSyncService } from '../constants/fileSync';
import { TreeLayoutInfo } from '../interfaces';

export const useFileSync = () => {
  const [fileContent, setFileContent] = useState<TreeLayoutInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const content = await fileSyncService.getFileContent();
      setFileContent(content);
    };

    loadData();

    // Subscribe to file changes
    const unsubscribe = fileSyncService.subscribe(() => {
      setRefreshKey(prev => prev + 1);
      loadData();
    });

    return () => unsubscribe();
  }, []);

  return { fileContent, refreshKey };
};