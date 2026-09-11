import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user: user?.email, account: account?.provider })

      if (!user.email) return false

      // Verificar si el email está en la whitelist
      const usuarioAutorizado = await db.usuarioAutorizado.findUnique({
        where: { email: user.email }
      })

      if (!usuarioAutorizado || !usuarioAutorizado.activo) {
        console.log('Usuario no autorizado:', user.email)
        return false
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      // Guardar el access token de Google en el JWT
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
      }
      // Pasar el access token a la sesión
      (session as any).accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
