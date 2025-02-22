import { Bucket } from "@google-cloud/storage";

export const getFullUrl = (path: string, bucket?: Bucket) => {
  const bucketName = bucket ? bucket.name : "nyxphere-dc81e.firebasestorage.app";
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
};