import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type FirebaseUser = {
  localId: string;
  email?: string;
  customAttributes?: string;
}

async function getIdToken(email: string, password: string) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();
    return data.idToken;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

async function getUserData(email: string, password: string): Promise<FirebaseUser | undefined> {
  const idToken = await getIdToken(email, password);
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idToken
      })
    });

    const data = await response.json();
    if (data.users && data.users.length > 0) {
      return data.users[0];
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return undefined;
  }
}

export const { handlers, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "email", required: true },
        password: { label: "password", type: "password", required: true }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const email = credentials.email as string;
          const user = await getUserData(email, credentials.password as string);
          if (user) {
            const customAttributes = JSON.parse(user.customAttributes ?? "{}");
            return { id: user.localId, email: email, role: customAttributes?.role ?? "guest" };
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.email = user.email ?? "";
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    }
  }
});