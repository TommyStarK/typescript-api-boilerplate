const IoCMongoDBClientIdentifier = {
  Symbol: Symbol.for('MongoDBClient'),
};

Object.seal(IoCMongoDBClientIdentifier);

export default IoCMongoDBClientIdentifier;
