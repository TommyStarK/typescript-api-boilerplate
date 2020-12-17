import 'reflect-metadata';

const IoCMedia = {
  ControllerIdentifier: Symbol.for('MediaController'),
  ServiceIdentifier: Symbol.for('MediaService'),
};

Object.seal(IoCMedia);

export default IoCMedia;
