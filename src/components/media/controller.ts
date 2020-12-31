import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { MediaService } from '@app/components/media';
import TYPES from '@app/IoC/types';

@injectable()
export class MediaController {
  constructor(@inject(TYPES.MediaService) private mediaService: MediaService) {}

  public async deletePicture(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const { userID } = request.decoded;
    const deletion = await this.mediaService.deletePicture(id, userID);
    response.status(deletion.status).json(deletion);
  }

  public async getPicture(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const { userID } = request.decoded;
    const download = await this.mediaService.getPicture(id, userID);
    response.status(download.status).json(download);
  }

  public async getPictures(request: Request, response: Response): Promise<void> {
    const { userID } = request.decoded;
    const fetch = await this.mediaService.getPictures(userID);
    response.status(fetch.status).json(fetch);
  }

  public async uploadNewPicture(request: Request, response: Response): Promise<void> {
    const { file } = request;
    const { userID } = request.decoded;
    const upload = await this.mediaService.uploadNewPicture(file, userID);
    response.status(upload.status).json(upload);
  }
}
