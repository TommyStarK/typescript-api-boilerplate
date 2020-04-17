import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

import mongodb from '../../storage/mongodb';
import utils from '../../utils';

const dir = path.join('.', '.uploads');

const mediaController = {
  deletePicture: async (pictureID, userID) => {
    if (!utils.checkStringLengthInBytes(pictureID)) {
      return {
        status: 422,
        message: 'Unprocessable Entity: picture ID must be a single string of either 12 bytes or 24 hex characters',
      };
    }

    const db = mongodb.getDatabase();
    const picObjectId = ObjectId(pictureID);
    const user = await db.collection('users').findOne({
      userID,
      'pictures.fileid': { $eq: picObjectId },
    });

    if (!user) {
      return { status: 404, message: `Picture with ID (${pictureID}) not found` };
    }

    await db.collection('users').updateOne(
      user,
      { $pull: { pictures: { fileid: picObjectId } } },
    );

    const target = await db.collection('fs.files').findOneAndDelete({
      _id: picObjectId,
    });

    await db.collection('fs.chunks').deleteMany({
      // eslint-disable-next-line no-underscore-dangle
      files_id: target.value._id,
    });

    return { status: 200, message: `Picture with ID (${pictureID}) has been deleted` };
  },

  getPictures: async (userID) => {
    const db = mongodb.getDatabase();
    const result = await db.collection('users')
      .find({ userID })
      .project({
        _id: 0,
        userID: 0,
        'pictures.hashname': 0,
        'pictures.encoding': 0,
        'pictures.mimetype': 0,
        'pictures.size': 0,
        videos: 0,
      }).toArray();

    if (!result.length) {
      return { status: 200, pictures: [] };
    }

    const { pictures } = result[0];
    return { status: 200, pictures };
  },

  getPicture: async (pictureID, userID) => {
    if (!utils.checkStringLengthInBytes(pictureID)) {
      return {
        status: 422,
        message: 'Unprocessable Entity: picture ID must be a single string of either 12 bytes or 24 hex characters',
      };
    }

    const db = mongodb.getDatabase();
    const bucket = mongodb.getBucket();
    const picObjectId = ObjectId(pictureID);
    const user = await db.collection('users').findOne({
      userID,
      'pictures.fileid': { $eq: picObjectId },
    });

    if (!user) {
      return { status: 404, message: `Picture with ID (${pictureID}) not found` };
    }

    // eslint-disable-next-line eqeqeq
    const pictureMetadata = user.pictures.find((elem) => elem.fileid == pictureID);
    const filePath = path.join(dir, pictureMetadata.name);
    await utils.writeFileAsync(filePath, '');
    const pipe = bucket.openDownloadStream(picObjectId).pipe(fs.createWriteStream(filePath));
    const download = new Promise((resolve, reject) => {
      pipe.on('finish', async () => {
        const tmp = await utils.encodeBase64(filePath);
        resolve(tmp);
      });
      pipe.on('error', reject);
    });

    const base64Pic = await download;
    await utils.unlinkAsync(filePath);

    return {
      status: 200,
      id: pictureID,
      name: pictureMetadata.name,
      picture: base64Pic,
    };
  },

  uploadNewPicture: async (file, userID) => {
    try {
      if (file === undefined) {
        return {
          status: 415,
          message: 'Unsupported Media Type: expecting form-data with key "file"',
        };
      }

      const db = mongodb.getDatabase();
      const bucket = mongodb.getBucket();
      const user = await db.collection('users').findOne(
        { userID },
      );

      if (!user) {
        await db.collection('users').insertOne(
          { userID, pictures: [], videos: [] },
        );
      }

      const picture = await db.collection('users').findOne({
        userID,
        'pictures.name': { $eq: file.originalname },
      });

      if (picture) {
        return {
          status: 409,
          message: `Conflict: Picture '${file.originalname}' already exists`,
        };
      }

      const upload = await fs.createReadStream(path.join(dir, file.filename))
        .pipe(bucket.openUploadStream(file.originalname));

      await db.collection('users').updateOne({ userID }, {
        $addToSet: {
          pictures: {
            name: file.originalname,
            hashname: file.filename,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            fileid: ObjectId(upload.id),
          },
        },
      });

      return {
        status: 201,
        pictureID: upload.id,
        pictureName: file.originalname,
      };
    // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw (error);
    } finally {
      if (file !== undefined && 'filename' in file) {
        await utils.unlinkAsync(path.join(dir, file.filename));
      }
    }
  },
};

export { mediaController as default };
