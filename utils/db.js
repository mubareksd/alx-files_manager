import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = MongoClient(`mongodb://${HOST}:${PORT}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(`${DATABASE}`);
      })
      .catch((err) => {
        console.log('error: ', err);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const usersList = this.db.collection('users');
    const numUsers = await usersList.countDocuments();
    return numUsers;
  }

  async nbFiles() {
    const filesList = this.db.collection('files');
    const numFiles = await filesList.countDocuments();
    return numFiles;
  }
}

const dbClient = new DBClient();

export default dbClient;
