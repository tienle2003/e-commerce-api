import { createClient } from "redis";
import config from "./config.js";

const redisClient = createClient({
    url: config.redis.url,
    host: config.redis.host,
    port: config.redis.port,
});

(async () => {
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.on("ready", () => console.log("Redis is ready"));

  await redisClient.connect();
})();

export default redisClient;
