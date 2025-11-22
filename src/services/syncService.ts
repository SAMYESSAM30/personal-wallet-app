/**
 * Sync Service
 * Handles synchronization of data between devices
 * Currently uses a simple implementation that can be extended to use Firebase, AWS, or other cloud services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, CustomCategory } from '../types/expense';

const SYNC_ENABLED_KEY = '@expense_app_sync_enabled';
const SYNC_USER_ID_KEY = '@expense_app_sync_user_id';
const LAST_SYNC_TIMESTAMP_KEY = '@expense_app_last_sync_timestamp';

export interface SyncStatus {
  isEnabled: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

export interface SyncData {
  transactions: Transaction[];
  customCategories: CustomCategory[];
  currency: string;
  monthlyResetEnabled: boolean;
  lastSyncTimestamp: number;
}

class SyncService {
  private syncEnabled: boolean = false;
  private userId: string | null = null;
  private lastSyncTimestamp: number = 0;
  private isSyncing: boolean = false;

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    try {
      const enabled = await AsyncStorage.getItem(SYNC_ENABLED_KEY);
      this.syncEnabled = enabled === 'true';

      const userId = await AsyncStorage.getItem(SYNC_USER_ID_KEY);
      this.userId = userId;

      const lastSync = await AsyncStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
      this.lastSyncTimestamp = lastSync ? parseInt(lastSync, 10) : 0;
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  /**
   * Enable sync and generate user ID if needed
   */
  async enableSync(): Promise<string> {
    try {
      if (!this.userId) {
        // Generate a simple user ID (in production, use proper authentication)
        this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(SYNC_USER_ID_KEY, this.userId);
      }

      this.syncEnabled = true;
      await AsyncStorage.setItem(SYNC_ENABLED_KEY, 'true');
      
      return this.userId;
    } catch (error) {
      console.error('Error enabling sync:', error);
      throw error;
    }
  }

  /**
   * Disable sync
   */
  async disableSync(): Promise<void> {
    try {
      this.syncEnabled = false;
      await AsyncStorage.setItem(SYNC_ENABLED_KEY, 'false');
    } catch (error) {
      console.error('Error disabling sync:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return {
      isEnabled: this.syncEnabled,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTimestamp > 0 ? new Date(this.lastSyncTimestamp) : null,
      error: null,
    };
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Upload data to cloud (placeholder - implement with actual cloud service)
   */
  async uploadData(data: SyncData): Promise<void> {
    if (!this.syncEnabled || !this.userId) {
      throw new Error('Sync is not enabled');
    }

    this.isSyncing = true;
    try {
      // TODO: Implement actual cloud upload
      // Example: await firebase.database().ref(`users/${this.userId}`).set(data);
      
      // For now, simulate upload delay
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      const timestamp = Date.now();
      this.lastSyncTimestamp = timestamp;
      await AsyncStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, timestamp.toString());
      
      console.log('Data uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading data:', error);
      throw new Error(error.message || 'Failed to upload data');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Download data from cloud (placeholder - implement with actual cloud service)
   */
  async downloadData(): Promise<SyncData | null> {
    if (!this.syncEnabled || !this.userId) {
      throw new Error('Sync is not enabled');
    }

    this.isSyncing = true;
    try {
      // TODO: Implement actual cloud download
      // Example: const snapshot = await firebase.database().ref(`users/${this.userId}`).once('value');
      // return snapshot.val();
      
      // For now, simulate download delay
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      // Return null if no data exists (first sync)
      return null;
    } catch (error: any) {
      console.error('Error downloading data:', error);
      throw new Error(error.message || 'Failed to download data');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync data (merge local and cloud data)
   */
  async syncData(localData: SyncData): Promise<SyncData> {
    if (!this.syncEnabled || !this.userId) {
      return localData;
    }

    try {
      // Download cloud data
      const cloudData = await this.downloadData();
      
      if (!cloudData) {
        // First sync - upload local data
        await this.uploadData(localData);
        return localData;
      }

      // Merge data (cloud data takes precedence for conflicts)
      const mergedData: SyncData = {
        transactions: this.mergeTransactions(localData.transactions, cloudData.transactions),
        customCategories: this.mergeCategories(localData.customCategories, cloudData.customCategories),
        currency: cloudData.currency || localData.currency,
        monthlyResetEnabled: cloudData.monthlyResetEnabled ?? localData.monthlyResetEnabled,
        lastSyncTimestamp: Date.now(),
      };

      // Upload merged data
      await this.uploadData(mergedData);
      
      return mergedData;
    } catch (error: any) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  /**
   * Merge transactions (cloud takes precedence)
   */
  private mergeTransactions(local: Transaction[], cloud: Transaction[]): Transaction[] {
    const mergedMap = new Map<string, Transaction>();
    
    // Add local transactions
    local.forEach(t => mergedMap.set(t.id, t));
    
    // Overwrite with cloud transactions (newer data)
    cloud.forEach(t => mergedMap.set(t.id, t));
    
    return Array.from(mergedMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Merge categories (cloud takes precedence)
   */
  private mergeCategories(local: CustomCategory[], cloud: CustomCategory[]): CustomCategory[] {
    const mergedMap = new Map<string, CustomCategory>();
    
    // Add local categories
    local.forEach(c => mergedMap.set(c.id, c));
    
    // Overwrite with cloud categories
    cloud.forEach(c => mergedMap.set(c.id, c));
    
    return Array.from(mergedMap.values());
  }
}

// Export singleton instance
export const syncService = new SyncService();

