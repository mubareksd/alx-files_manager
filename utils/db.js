import { MongoClient } from "mongodb";

const HOST = process.env.DB_HOST || "localhost";
const PORT = process.env.DB_PORT || "27017";
const DATABASE = process.env.DB_DATABASE || "files_manager";

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
        console.log("error: ", err);
      });
  }
  isAlive = () => {
    return this.client.isConnected();
  };
  nbUsers = async () => {
    const users_list = this.db.collection("users");
    const num_users = await users_list.countDocuments();
    return num_users;
  };
  nbFiles = async () => {
    const files_list = this.db.collection("files");
    const num_files = await files_list.countDocuments();
    return num_files;
  };
}

const dbClient = new DBClient();

export default dbClient;
