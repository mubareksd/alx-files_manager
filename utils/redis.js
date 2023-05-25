import { createClient } from "redis";
import { promisify } from "util";

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on("error", (err) => {
      console.log("Error " + err);
    });
  }

  isAlive = () => {
    return this.client.connected;
  };

  get = async (key) => {
    return await promisify(this.client.get).bind(this.client)(key);
  };

  set = async (key, value, duration) => {
    await promisify(this.client.set).bind(this.client)(key, value);
    await promisify(this.client.expire).bind(this.client)(key, duration);
  };

  del = async (key) => {
    await promisify(this.client.del).bind(this.client)(key);
  };
}

const redisClient = new RedisClient();

export default redisClient;
