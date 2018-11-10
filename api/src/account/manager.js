export const account = {
  authorize: async (request, response, next) => {
    return response.status(200).json(
        {status: 200, success: true, token: 'token'});
  },

  register: async (request, response, next) => {
    return response.status(200).json({
      status: 201,
      success: true,
      message: 'Account registered successfully.'
    });
  },

  unregister: async (request, response, next) => {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Account unregistered successfully.'
    });
  }

};