import { RedisClient } from 'redis';

export interface CacheService {
  setValue(key: string, value: string): Promise<void>;
  getValue(key: string): Promise<string | null>;
}

export const cache = (client: RedisClient): CacheService => {
  return {
    setValue(key: string, value: string): Promise<void> {
      return new Promise((resolve, reject) => {
        client.set(key, value, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    },
    getValue(key: string): Promise<string | null> {
      return new Promise((resolve, reject) => {
        client.get(key, (err, value) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(value);
        });
      });
    }
  };
};