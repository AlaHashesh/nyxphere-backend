import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { z } from "zod";
import { auth } from "@/lib/firebase/serverApp";
import { getIdToken } from "@/auth";
import { BadRequestError } from "@/errors/BadRequestError";
import { OAuth2Client } from "google-auth-library";
import { encode } from "@/lib/jwt";

const credentialsRequestScheme = z.object({
  provider: z.literal("credentials"),
  email: z.string().email(),
  password: z.string().trim().min(1)
});

const googleRequestScheme = z.object({
  provider: z.literal("google"),
  idToken: z.string().min(1)
});

const RequestPayloadScheme = z.discriminatedUnion("provider", [
  credentialsRequestScheme,
  googleRequestScheme
]);

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

const handler = async (req: NextRequest) => {

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse({
    ...payload
  });

  let firebaseUser = undefined;
  if (payload.provider === "credentials") {
    const { email, password } = payload;

    const idToken = await getIdToken(email, password);
    if (!idToken) {
      throw new BadRequestError("Invalid email or password");
    }

    firebaseUser = await auth.getUserByEmail(email);
  } else if (payload.provider === "google") {
    const { idToken } = payload;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_SERVER);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID_SERVER
    });

    const payloadData = ticket.getPayload();
    if (!payloadData || !payloadData.email) {
      throw new BadRequestError("Invalid credentials");
    }

    try {
      firebaseUser = await auth.getUserByEmail(payloadData.email);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // User doesn't exist, create them
        firebaseUser = await auth.createUser({
          email: payloadData.email,
          emailVerified: true,
          displayName: payloadData.name,
          photoURL: payloadData.picture
        });

        // Optionally, set custom claims like role
        await auth.setCustomUserClaims(firebaseUser.uid, { role: "guest" });
      } else {
        throw error; // some other error
      }
    }
  }

  if (firebaseUser === undefined) {
    throw new BadRequestError("Invalid credentials");
  }

  const user = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? firebaseUser.email,
    email: firebaseUser.email!,
    emailVerified: firebaseUser.emailVerified,
    role: firebaseUser.customClaims?.role ?? "guest"
  };

  const accessToken = await encode(user);

  return NextResponse.json({
    user: user,
    tokens: {
      accessToken: accessToken
    }
  }, { status: 200 });
};

export const POST = withErrorHandler(handler);