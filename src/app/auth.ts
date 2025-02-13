import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import type { NextAuthConfig } from "next-auth"

export const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    AzureADProvider({
      clientId: process.env.AUTH_AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AUTH_AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_AZURE_AD_TENANT_ID}/v2.0`,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL('/', nextUrl))
      }
      return isLoggedIn || isOnLoginPage
    },
  },
  pages: {
    signIn: "/login",
  },
 // trustHost: process.env.AUTH_TRUST_HOST === 'true',
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// Protect all routes except /login
export const authConfig = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
}
