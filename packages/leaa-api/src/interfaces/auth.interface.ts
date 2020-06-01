import { FindOneOptions } from 'typeorm';
import { AuthGetManyReq, AuthGetOneReq } from '@leaa/common/src/dtos/auth';
import { Auth, User } from '@leaa/common/src/entrys';

export type IAuthsArgs = AuthGetManyReq & FindOneOptions<Auth>;
export type IAuthArgs = AuthGetOneReq & FindOneOptions<Auth>;

export interface IWechatDecryptUserInfo {
  openId: string;
  nickName: string;
  gender: number;
  language: string;
  city: string;
  province: string;
  country: string;
  avatarUrl: string;
  watermark: {
    timestamp: number;
    appid: string;
  };
}

export interface ICreateAuthAndUserResult {
  newUser: User | undefined;
  newAuth: Auth | undefined;
}

export interface IWechatInfo {
  openid: string;
  nickname: string;
  sex: number;
  language: string;
  //
  country: string;
  province: string;
  city: string;
  //
  headimgurl: string;
  privilege: any[];
}

export interface IMiniprogramCloudFnAuthInfo {
  APPID: string;
  OPENID: string;
  CLIENTIP: string;
  CLIENTIPV6: string;
  ENV: string;
  SOURCE: string;
}

export interface IMiniprogramCloudFnUserInfo {
  errMsg: string;
  rawData: string;
  userInfo: {
    nickName: string;
    gender: number;
    language: string;
    city: string;
    province: string;
    country: string;
    avatarUrl: string;
  };
  signature: string;
  encryptedData: string;
  iv: string;
  cloudID: string;
}

export interface IMiniprogramCloudFnResult {
  auth: IMiniprogramCloudFnAuthInfo;
  user: IMiniprogramCloudFnUserInfo;
}
