import { ObjectId } from 'mongodb';
import { v4 as uuid4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';

import { redisClient, dbClient } from '../utils';

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.header('X-Token');
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
        });
      }

      const user = await dbClient.db.collection('users').findOne({
        _id: ObjectId(userId),
      });

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
        });
      }

      const {
        name, type, parentId, isPublic, data,
      } = req.body;

      const acceptedTypes = ['folder', 'file', 'image'];

      if (!name) {
        return res.status(400).json({
          error: 'Missing name',
        });
      }

      if (!type && !acceptedTypes.includes(type)) {
        return res.status(400).json({
          error: 'Missing type',
        });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({
          error: 'Missing data',
        });
      }

      if (parentId) {
        const parent = await dbClient.db.collection('files').findOne({
          _id: ObjectId(parentId),
        });

        if (!parent) {
          return res.status(400).json({
            error: 'Parent not found',
          });
        }

        if (parent.type !== 'folder') {
          return res.status(400).json({
            error: 'Parent is not a folder',
          });
        }

        if (parent.userId.toString() !== user._id.toString()) {
          return res.status(403).json({
            error: 'unauthorized',
          });
        }
      }
      let resu;
      if (type === 'folder') {
        resu = {
          userId: ObjectId(userId),
          name,
          type,
          isPublic: isPublic || false,
          parentId: parentId || 0,
        };
      } else {
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
        await mkdir(FOLDER_PATH, { recursive: true });
        const filePath = `${FOLDER_PATH}/${uuid4()}`;
        await writeFile(filePath, Buffer.from(data, 'base64'));
        resu = {
          userId: ObjectId(userId),
          name,
          type,
          isPublic: isPublic || false,
          parentId: parentId || 0,
        };
      }
      const result = await dbClient.db.collection('files').insertOne(resu);
      return res.status(201).json({
        id: result.insertedId,
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
}

export default FilesController;
