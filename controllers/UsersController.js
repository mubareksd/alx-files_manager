import sha1 from 'sha1';
import { ObjectID } from 'mongodb';

import { redisClient, dbClient } from '../utils';

class UsersController {
  static postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Missing email',
        });
      }

      if (!password) {
        return res.status(400).json({
          error: 'Missing password',
        });
      }

      const user = dbClient.db.collection('users').findOne({ email });

      if (user) {
        return res.status(400).json({
          error: 'Already exist',
        });
      }

      const securePassword = sha1(password);

      const newUser = dbClient.db.collection('users').insertOne({
        email,
        password: securePassword,
      });

      return res.status(201).json({
        id: newUser._id,
        email: newUser.email,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
        });
      }

      const user = await dbClient.db
        .collection('users')
        .findOne({ _id: ObjectID(userId) });
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
        });
      }

      return res.status(200).json({
        _id: userId,
        email: user.email,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
}

export default UsersController;
