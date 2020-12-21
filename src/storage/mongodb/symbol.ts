const IoCMongoDBClientIdentifier = Symbol.for('MongoDBClient');
Object.seal(IoCMongoDBClientIdentifier);

export default IoCMongoDBClientIdentifier;
