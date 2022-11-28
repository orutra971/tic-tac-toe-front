import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface ITokenAccess {
  accessToken: string,
  refreshToken: string,
  accessTokenExpires: string,
}


export async function refreshAccessToken(refreshToken: string) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_BASE}/auth/token/refresh`,
    {refreshToken: refreshToken}
  )
  .then((response) =>  response.data)
  .catch((error) => {
    throw new Error(error.response.data.message);
  });
}

export const config = {
  api: {
    bodyParser: true,
  },
};

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Sign in',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "exampe@example.com" },
        password: {  label: "Password", type: "password" }
      },
      authorize: async (credentials) : Promise<User> => {
        const payload = {
          email: credentials.email,
          password: credentials.password,
        };
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        return await axios.post(`${process.env.NEXTAUTH_URL}/signin`, payload)
        .then((res) => {    
          return {...res.data, name: res.data.username};
        })
        .catch((error) => {    
          throw new Error(error.response.data.message);
        }) || null;
      },
    })
  ],
  secret: process.env.NEXT_PUBLIC_SECRET,
  session: {strategy: "jwt"},
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> =>{
      // Initial sign in
      if (user && user.accessToken) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          id: user.id,
          image: user.image,
        };
      }

      // If token has not expired, return it,
      if (Date.now() < Number(token.accessTokenExpires)) {
        return token
      }   
      const res = await refreshAccessToken(token.refreshToken);

      console.log("res", res);

      if (res.accessToken) {
        return {
          ...token,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          accessTokenExpires: res.accessTokenExpires,
        };
      }

      return token;
    },
    session: async ({ session, token }): Promise<Session> => {

      if (session.user && token.accessToken ) {
        return {
          ...session,
          user: {
            ...session.user,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            accessTokenExpires: token.accessTokenExpires,
            id: token.id,
            image: token.image,
          }
        };
      }

      return session;
    },
  },
  pages: {
    signIn: "/login", //Need to define custom login page (if using)
    newUser: "/",
    error: "/login",
    signOut: "/", //Need to define custom login page (if using)
  },
  theme: {
    colorScheme: "dark",
  },
  debug: false,
}

export default NextAuth(authOptions);
