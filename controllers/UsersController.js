import sha1 from "sha1";

import dbClient from "../utils/db";

class UsersController {
  static postNew = (req, res) => {
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
  };
}

export default UsersController;
