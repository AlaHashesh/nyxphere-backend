import { createCache } from "cache-manager";
import { createKeyv } from "cacheable";
import { DiskStore } from "cache-manager-fs-hash";

const memoryStore = createKeyv({
  ttl: "1y"
});

const diskStore = new DiskStore({
  path: "diskcache",
  zip: true
});

export const cache = createCache({
  stores: [memoryStore, diskStore]
});