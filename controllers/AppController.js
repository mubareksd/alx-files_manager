import redisClient from "../utils/redis";
import dbClient from "../utils/db";

class AppController {
  static getStatus = (req, res) => {
    return res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  };

  static getStats = async (req, res) => {
    return res.status(200).json({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  };
}

export default AppController;
