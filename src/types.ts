type MediaOpResult = {
  status: number;
  message?: string;
  id?: string,
  name?: string,
  picture?: string | unknown,
  pictures?: {name: string, fileid: string}[];
};

type UserOpResult = {
  status: number;
  message?: string;
  token?: string;
};

export {
  MediaOpResult,
  UserOpResult,
};
