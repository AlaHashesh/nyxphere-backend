import { db } from "@/lib/firebase/serverApp";
import { BadRequestError } from "@/errors/BadRequestError";

export const findById = async (id: string) => {
  const docRef = db.collection("categories").doc(id);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists || docSnapshot.data() === undefined) {
    throw new BadRequestError("Category does not exist");
  }

  return { ref: docRef, snapshot: docSnapshot };
};

export const findParent = async (id: string) => {
  const docRef = db.collection("categories").doc(id);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists || docSnapshot.data()?.parent === undefined) {
    throw new BadRequestError("Category does not exist");
  }

  const parent = docSnapshot.data()!.parent;
  const parentSnapshot = await parent.get();

  return { ref: parent, snapshot: parentSnapshot };
};
