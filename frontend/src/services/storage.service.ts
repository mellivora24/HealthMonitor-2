import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
    static async setItem(key: string, value: any): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Error saving to storage:', error);
            throw error;
        }
    }

    static async getItem<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }

    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from storage:', error);
            throw error;
        }
    }

    static async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }

    static async multiGet(keys: string[]): Promise<Record<string, any>> {
        try {
            const pairs = await AsyncStorage.multiGet(keys);
            const result: Record<string, any> = {};
            pairs.forEach(([key, value]) => {
                if (value) {
                    result[key] = JSON.parse(value);
                }
            });
            return result;
        } catch (error) {
            console.error('Error reading multiple from storage:', error);
            return {};
        }
    }
}
