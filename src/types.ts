type MediaOperationResponse = {
  status: number;
  message?: string;
  id?: string,
  name?: string,
  picture?: string | unknown,
  pictures?: {name: string, fileid: string}[];
};

type UserOperationResponse = {
  status: number;
  message?: string;
  token?: string;
};

export {
  MediaOperationResponse,
  UserOperationResponse,
};
