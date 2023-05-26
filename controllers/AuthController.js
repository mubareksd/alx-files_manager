import sha1 from "sha1";
import { v4 as uuid4 } from "uuid";
import { redisClient, dbClient } from "../utils";

class AuthController {
  static getConnect = async (req, res) => {
    try {
      const { authorization } = req.headers;
      const buff = Buffer.from(authorization.split(" ")[1], "base64");
      const credentials = {
        email: buff.toString("utf-8").split(":")[0],
        password: buff.toString("utf-8").split(":")[1],
      };
      const user = await dbClient.db
        .collection("users")
        .findOne({ email: credentials.email });
      const token = uuid4();
      const key = `auth_${token}`;
      redisClient.set(key, user._id.toString(), 60 * 60 * 24);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({
        data: null,
        success: false,
        message: `${error.message}`,
      });
    }
  };

  static getDisconnect = async (req, res) => {
    try {
      const token = req.header("X-Token");
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }
      await redisClient.del(key);
      return res.status(204).json({});
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };
}

export default AuthController;
