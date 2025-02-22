import { db } from "@/lib/firebase/serverApp";
import { BadRequestError } from "@/errors/BadRequestError";

export const findById = async (id: string) => {
  const docRef = db.collection("items").doc(id);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) {
    throw new BadRequestError("Item does not exist");
  }

  return { ref: docRef, snapshot: docSnapshot };
};
