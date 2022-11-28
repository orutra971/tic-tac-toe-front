module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_BASE: process.env.NEXT_PUBLIC_BACKEND_BASE,
    NEXT_PUBLIC_SECRET: process.env.NEXT_PUBLIC_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }
}