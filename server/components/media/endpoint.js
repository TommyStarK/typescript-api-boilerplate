import mediaController from './controller';

const mediaAPI = {
  deletePicture: async (request, response) => {
    const { id } = request.params;
    const { userID } = request.decoded;
    const deletion = await mediaController.deletePicture(id, userID);
    return response.status(deletion.status).json(deletion);
  },

  getPicture: async (request, response) => {
    const { id } = request.params;
    const { userID } = request.decoded;
    const download = await mediaController.getPicture(id, userID);
    return response.status(download.status).json(download);
  },

  getPictures: async (request, response) => {
    const { userID } = request.decoded;
    const fetch = await mediaController.getPictures(userID);
    return response.status(fetch.status).json(fetch);
  },

  uploadNewPicture: async (request, response) => {
    const { file } = request;
    const { userID } = request.decoded;
    const upload = await mediaController.uploadNewPicture(file, userID);
    return response.status(upload.status).json(upload);
  },
};

export { mediaAPI as default };
