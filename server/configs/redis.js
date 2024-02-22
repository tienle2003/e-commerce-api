import { createClient } from "redis";
import config from "./config.js";

const redisConfig = {
  HOST: config.redis.host,
  PORT: config.redis.port,
};

const redisClient = createClient({
    host: config.redis.host,
    port: config.redis.port,
});

(async () => {
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.on("ready", () => console.log("Redis is ready"));

  await redisClient.connect();
})();

export default redisClient;
