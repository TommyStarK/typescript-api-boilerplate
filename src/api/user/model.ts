interface AuthPayload {
  username: string;
  password: string;
}

interface RegistrationPayload extends AuthPayload {
  email: string;
}

export {
  AuthPayload,
  RegistrationPayload,
};
