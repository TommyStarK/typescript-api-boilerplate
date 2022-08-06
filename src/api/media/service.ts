import fs from 'fs';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import path from 'path';

import { MongoDBClient } from '@app/backends/mongo';
import TYPES from '@app/inversion-of-control/types';

import {
  ConflictError,
  NotFoundError,
  UnsupportedMediaTypeError,
} from '@app/utils/errors';

import {
  encodeBase64,
  unlinkAsync,
  writeFileAsync,
} from '@app/utils/filesystem';

@injectable()
export class MediaService {
  private readonly uploadDirectoryPath = path.join('.', '.uploads');

  constructor(@inject(TYPES.MongoDBClient) private mongoClient: MongoDBClient) {}

  public async deletePicture(pictureID: string, userID: string): Promise<{ status: number, message: string }> {
    const { database } = this.mongoClient;
    const picObjectId = new ObjectId(pictureID);

    const user = await database.collection('users').findOne({
      userID,
      'pictures.fileid': { $eq: picObjectId },
    });

    if (!user) {
      throw new NotFoundError(`Picture with ID (${pictureID}) not found`);
    }

    await database.collection('users').updateOne(
      user,
      { $pull: { pictures: { fileid: picObjectId } } },
    );

    const target = await database.collection('fs.files').findOneAndDelete({
      _id: picObjectId,
    });

    await database.collection('fs.chunks').deleteMany({
      files_id: target.value._id,
    });

    return { status: 200, message: `Picture with ID (${pictureID}) has been deleted` };
  }

  public async getPicture(pictureID: string, userID: string): Promise<{
    status: number,
    message?: string,
    id?: string,
    name?: string,
    picture?: string,
  }> {
    const { bucket, database } = this.mongoClient;
    const picObjectId = new ObjectId(pictureID);

    const user = await database.collection('users').findOne({
      userID,
      'pictures.fileid': { $eq: picObjectId },
    });

    if (!user) {
      throw new NotFoundError(`Picture with ID (${pictureID}) not found`);
    }

    // eslint-disable-next-line eqeqeq
    const pictureMetadata = user.pictures.find((elem: { fileid: string; }) => elem.fileid == pictureID);
    const filePath = path.join(this.uploadDirectoryPath, pictureMetadata.name);

    await writeFileAsync(filePath, '');

    const pipe = bucket.openDownloadStream(picObjectId).pipe(fs.createWriteStream(filePath));
    const download = new Promise<string>((resolve, reject) => {
      pipe.on('finish', async () => resolve(await encodeBase64(filePath)));
      pipe.on('error', reject);
    });

    const base64Pic = await download;
    await unlinkAsync(filePath);

    return {
      status: 200,
      id: pictureID,
      name: pictureMetadata.name,
      picture: base64Pic,
    };
  }

  public async getPictures(userID: string): Promise<{ status: number, pictures: { name: string, fileid: string }[] }> {
    const { database } = this.mongoClient;

    const result = await database.collection('users')
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

    return { status: 200, pictures: result[0].pictures };
  }

  public async uploadNewPicture(file: Express.Multer.File, userID: string): Promise<{
    status: number,
    message?: string,
    id?: string,
    name?: string,
  }> {
    if (file === undefined) {
      throw new UnsupportedMediaTypeError('Unsupported Media Type: expecting form-data with key "file"');
    }

    const { bucket, database } = this.mongoClient;

    const user = await database.collection('users').findOne(
      { userID },
    );

    if (!user) {
      await database.collection('users').insertOne(
        { userID, pictures: [] },
      );
    }

    const picture = await database.collection('users').findOne({
      userID,
      'pictures.name': { $eq: file.originalname },
    });

    if (picture) {
      throw new ConflictError(`Conflict: Picture '${file.originalname}' already exists`);
    }

    const upload = fs.createReadStream(path.join(this.uploadDirectoryPath, file.filename))
      .pipe(bucket.openUploadStream(file.originalname));

    await database.collection('users').updateOne({ userID }, {
      $addToSet: {
        pictures: {
          name: file.originalname,
          hashname: file.filename,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
          fileid: upload.id,
        },
      },
    });

    await unlinkAsync(path.join(this.uploadDirectoryPath, file.filename));

    return {
      status: 201,
      id: upload.id.toString(),
      name: file.originalname,
    };
  }
}
