const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");

const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  const cachedValue = await client.get(key);

  if (cachedValue) {
    const docs = JSON.parse(cachedValue);
    return Array.isArray(docs)
      ? docs.map((doc) => new this.model(doc))
      : new this.model(docs);
  }

  const result = await exec.apply(this, arguments);

  client.set(key, JSON.stringify(result));
  return result;
};
