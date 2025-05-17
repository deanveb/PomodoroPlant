import * as FileSystem from 'expo-file-system';

type Subscriber = () => void;

class FileSyncService {
  private subscribers: Subscriber[] = [];
  private lastUpdate: number = 0;
  private watcher: FileSystem.DownloadResumable | null = null;
  private fileUri: string;

  constructor() {
    this.fileUri = FileSystem.documentDirectory + 'treeLayout.json';
    this.setupWatcher();
  }

  private async setupWatcher() {
    // Create file if doesn't exist
    await this.ensureFileExists();

    // Watch for changes
    this.watcher = FileSystem.createDownloadResumable(
      this.fileUri,
      this.fileUri,
      {},
      (downloadProgress) => {
        const { totalBytesWritten } = downloadProgress;
        if (totalBytesWritten > this.lastUpdate) {
          this.lastUpdate = totalBytesWritten;
          this.notifySubscribers();
        }
      }
    );
    
    await this.watcher.downloadAsync();
  }

  private async ensureFileExists() {
    const fileInfo = await FileSystem.getInfoAsync(this.fileUri);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(this.fileUri, '{}');
    }
  }

  public subscribe(callback: Subscriber) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  public async forceRefresh() {
    this.notifySubscribers();
  }

  public async getFileContent() {
    await this.ensureFileExists();
    const content = await FileSystem.readAsStringAsync(this.fileUri);
    return JSON.parse(content);
  }
}

export const fileSyncService = new FileSyncService();