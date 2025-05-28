import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
const options: AuthOptions = {
  //SIGN IN CHAY TRUOC JWT, TRONG SIGNIN SE RETURN 1 THANG USER, JWT CHAY TRUOC SESSION
  // Configure one or more authentication providers
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        // Check if userData is provided (from the API response)
        if (credentials.userData) {
          try {
            // Parse the userData JSON string into an object
            const userData = JSON.parse(credentials.userData as string);

            // Return the user data directly without database lookup
            return {
              id: userData.id,
              name: userData.username,
              email: userData.email,
              role: userData.roles?.[0] || 'User',
              avatar: userData.photoUrl,
              isVerified: true, // Assuming user is verified if they successfully logged in
              // Pass through other data that might be needed in session
              token: userData.token,
              photos: userData.photos,
            };
          } catch (error) {
            console.error('Error parsing userData:', error);
            throw new Error('Invalid user data format');
          }
        }

        // Fall back to traditional email/password validation if no userData
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) throw new Error('Email or password is incorrect');
        if (user.password !== password)
          throw new Error('Email or password is incorrect');

        return {
          name: user.name,
          email: user.email,
          role: user.role,
          id: user.id,
          avatar: user.avatar,
          isVerified: user.isEmailVerified,
        };
      },
    }),

    // ...add more providers here
  ],

  callbacks: {
    async signIn(params) {
      if (!params?.user?.id || parseInt(params?.user?.id) === -1) {
        const payload = jwt.sign(
          { email: params?.user?.email, name: params?.user?.name },
          process.env.NEXT_PUBLIC_JWT_SECRET,
          { expiresIn: '1h' }
        );
        return `/auth/register/?payload=${payload}`;
      }

      return true;
    },
    //first it run the jwt function, the jwt function will return the token , then in the session function we can access the token
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user };
      }
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.avatar = user.avatar;
        token.name = user.name;
        token.email = user.email;
        token.isEmailVerified = user.isVerified;
      }
      //user is from the oauth config or in the credentials setting options

      //return final token
      return token;
    },
    async session({ token, session }) {
      // if (!userFind) {
      //   return {
      //     redirectTo: `/auth/login?email=${session?.user.email}&name=${session?.user.name}`,
      //   };
      // }
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { name: string }).name = token.name as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { avatar: string }).avatar = token.avatar as string;
        (session.user as { email: string }).email = token.email as string;
        (session.user as { isEmailVerified: boolean }).isEmailVerified =
          token.isEmailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
export default options;
