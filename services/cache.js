const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/dev");

const redisUrl = keys.redisUrl;
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  const cachedValue = await client.hget(this.hashKey, key);

  if (cachedValue) {
    const docs = JSON.parse(cachedValue);
    return Array.isArray(docs)
      ? docs.map((doc) => new this.model(doc))
      : new this.model(docs);
  }

  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result), "EXP", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
