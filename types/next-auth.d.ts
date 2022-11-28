import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { ObjectId } from "mongodb";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    image: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: string;
  }
  interface Session {
    user: User;
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    image: string;
    name: string;
    email: string;
    picture: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: string;
  }
}