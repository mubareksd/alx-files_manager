import { redisClient, dbClient } from "../utils";

class AppController {
  static getStatus = (req, res) => {
    try {
      return res.status(200).json({
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };

  static getStats = async (req, res) => {
    try {
      return res.status(200).json({
        users: await dbClient.nbUsers(),
        files: await dbClient.nbFiles(),
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };
}

export default AppController;
