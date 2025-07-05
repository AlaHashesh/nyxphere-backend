import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

type CacheParams = {
  key: string | Function;
}

async function getCacheKey(params: CacheParams | string | Function, args: any[]) {
  if (typeof params === "string") {
    return params;
  }

  if (typeof params === "function") {
    return await params(...args);
  }

  if (typeof params === 'object') {
    if (typeof params.key === "string") {
      return params.key;
    }

    if (typeof params.key === "function") {
      return await params.key(...args);
    }
  }

  return undefined;
}

export function withCacheableHandler(cacheParams: CacheParams | string | Function, handler: Function) {
  return async (...args: any[]) => {
    const key = await getCacheKey(cacheParams, args);
    if (key) {
      const cachedResponse = await cache.get(key);
      if (cachedResponse) {
        try {
          const data = JSON.parse(cachedResponse as string);
          return NextResponse.json(data, { status: 200 });
        } catch {
        }
      }
    }

    const response = await handler(...args);
    if (response instanceof NextResponse) {
      try {
        const body = await response.clone().json();
        if (key) {
          await cache.set(key, JSON.stringify(body));
        }
      } catch {
      }
    }

    return response;
  };
}