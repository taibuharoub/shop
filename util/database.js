const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect("mongodb://localhost:27017/local-shop", {
    useUnifiedTopology: true
  })
    .then((client) => {
      console.log("Connected");
      _db = client.db()
      callback()
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () =>{
  if (_db) {
    return _db;
  }
  throw "NO database found!";
}


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;