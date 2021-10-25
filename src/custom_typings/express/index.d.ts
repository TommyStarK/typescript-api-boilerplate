declare namespace Express {
  interface Request {
    file?: Multer.File;
    user: { userID: string; username: string };
  }
}
