import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const handler = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.AUTH_COGNITO_CLIENT_ID!,
      clientSecret: process.env.AUTH_COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.AUTH_COGNITO_ISSUER!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.sub) {
        token.userId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.userId = token.userId;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };