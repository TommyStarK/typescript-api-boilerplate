const IoCMySQLClientIdentifier = Symbol.for('MySQLClient');
Object.seal(IoCMySQLClientIdentifier);

export default IoCMySQLClientIdentifier;
