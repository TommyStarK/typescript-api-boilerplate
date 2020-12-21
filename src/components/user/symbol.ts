const IoCUser = {
  ControllerIdentifier: Symbol.for('UserController'),
  ServiceIdentifier: Symbol.for('UserService'),
};

Object.seal(IoCUser);

export default IoCUser;
