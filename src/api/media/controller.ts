import autoBind from 'auto-bind';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import TYPES from '@app/inversion-of-control/types';

import { MediaService } from './service';

@injectable()
export class MediaController {
  constructor(@inject(TYPES.MediaService) private mediaService: MediaService) {
    autoBind(this);
  }

  public async deletePicture(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const { userID } = request.user;

    const deletion = await this.mediaService.deletePicture(id, userID);

    response.status(deletion.status).json(deletion);
  }

  public async getPicture(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const { userID } = request.user;

    const download = await this.mediaService.getPicture(id, userID);

    response.status(download.status).json(download);
  }

  public async getPictures(request: Request, response: Response): Promise<void> {
    const { userID } = request.user;

    const fetch = await this.mediaService.getPictures(userID);

    response.status(fetch.status).json(fetch);
  }

  public async uploadNewPicture(request: Request, response: Response): Promise<void> {
    const { file } = request;
    const { userID } = request.user;

    const upload = await this.mediaService.uploadNewPicture(file, userID);

    response.status(upload.status).json(upload);
  }
}
