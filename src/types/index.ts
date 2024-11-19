import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?: number;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
  };
}

export interface AuthCookie {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenPayload {
  id: string;
}

export interface ITenant {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: ITenant;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface LimitedUserData extends Request {
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}

// export interface TokenPayload {
//   sub: string;
//   role: string;
// }
