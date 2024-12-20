import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // On sign-in, create or update user in DB
      // TODO: Implement user creation/update logic
      if (!user?.email) return false;
      return true;
    },
  },
});

export { handler as GET, handler as POST }; 