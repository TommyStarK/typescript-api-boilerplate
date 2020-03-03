import userController from './controller';

const userAPI = {
  authorize: async (request, response) => {
    const auth = await userController.authenticate(request.body);
    return response.status(auth.status).json(auth);
  },

  register: async (request, response) => {
    const registration = await userController.create(request.body);
    return response.status(registration.status).json(registration);
  },

  unregister: async (request, response) => {
    const unregistration = await userController.delete(request.body);
    return response.status(unregistration.status).json(unregistration);
  },
};

export { userAPI as default };
