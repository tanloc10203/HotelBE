import redis from "redis";

const clientRedis = redis.createClient();

class Redis {
  static get = async (key: string): Promise<string | null> =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await clientRedis.get(key);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

  static set = async (key: string, value: string | number): Promise<string | null> =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await clientRedis.set(key, value);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

  static incrBy = async (key: string, increment: number): Promise<number> =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await clientRedis.incrBy(key, increment);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

  static decrBy = async (key: string, decrement: number): Promise<number> =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await clientRedis.decrBy(key, decrement);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

  static exists = async (key: string): Promise<number> =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await clientRedis.exists(key);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

  /**
   * If key exist => handler only one
   * @param key
   * @param value
   * @returns
   */
  static setNX = async (key: string, value: string): Promise<boolean> =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await clientRedis.setNX(key, value);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
}

export default Redis;
