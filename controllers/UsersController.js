import sha1 from "sha1";
import { ObjectID } from "mongodb";

import { redisClient, dbClient } from "../utils";

class UsersController {
  static postNew = (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Missing email",
        });
      }

      if (!password) {
        return res.status(400).json({
          error: "Missing password",
        });
      }

      dbClient.db.collection("users").findOne({ email }, (err, result) => {
        if (err) {
          return res.status(400).json({
            error: err.message,
          });
        }

        if (result) {
          return res.status(400).json({
            error: "Already exist",
          });
        }

        const securePassword = sha1(password);

        dbClient.db.collection("users").insertOne(
          {
            email,
            password: securePassword,
          },
          (err) => {
            if (err) {
              return res.status(400).json({
                error: err.message,
              });
            }

            return res.status(201).json({
              email,
              password,
            });
          }
        );
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };

  static getMe = async (req, res) => {
    try {
      const token = req.header("X-Token");
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      await dbClient.db
        .collection("users")
        .findOne({ _id: ObjectID(userId) }, (err, result) => {
          if (err) {
            return res.status(404).json({
              error: "Not found",
            });
          }

          return res.status(200).json({
            _id: userId,
            email: result.email,
          });
        });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };
}

export default UsersController;
