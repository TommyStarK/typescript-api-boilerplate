declare namespace Express {
  interface Request {
    decoded: any;
    file: Multer.File;
  }
}
