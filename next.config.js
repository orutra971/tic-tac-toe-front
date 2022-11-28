module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_BASE: process.env.NEXT_PUBLIC_BACKEND_BASE,
    SECRET: process.env.SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    BASE_URL: process.env.BASE_URL,
  }
}