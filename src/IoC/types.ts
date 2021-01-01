const TYPES = {
  MediaController: Symbol.for('MediaController'),
  MediaService: Symbol.for('MediaService'),
  MongoDBClient: Symbol.for('MongoDBClient'),
  MySQLClient: Symbol.for('MySQLClient'),
  UserController: Symbol.for('UserController'),
  UserService: Symbol.for('UserService'),
};

Object.seal(TYPES);

export default TYPES;
