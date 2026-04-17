type AdaptyAccessLevel = {
  access_level_id: string,
  starts_at: string,
  expires_at: string | null,
}

type AdaptyProfile = {
  profile_id: string,
  customer_user_id: string,
  access_levels?: AdaptyAccessLevel[],
}

type GetProfileResponse = {
  data: AdaptyProfile,
}

type GrantAccessLevelPayload = {
  access_level_id: "premium",
  starts_at: string,
  expires_at: string | null
}

type RevokeAccessLevelPayload = {
  access_level_id: "premium",
}

type ProfileParams = {
  customerUserId?: string,
  profileId?: string,
}

const getHeaders = (params: ProfileParams) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Api-Key ${process.env.ADAPTY_SECRET_KEY}`);
  if (params.profileId && params.customerUserId) {
    throw new Error("You can't specify both profileId and customerUserId");
  }

  if (params.profileId) {
    myHeaders.append("adapty-profile-id", `${params.profileId}`);
  }

  if (params.customerUserId) {
    myHeaders.append("adapty-customer-user-id", `${params.customerUserId}`);
  }

  myHeaders.append("Content-Type", "application/json");

  return myHeaders;
};

export const getProfile = async (params: ProfileParams) => {
  return fetch("https://api.adapty.io/api/v2/server-side-api/profile/", {
    method: "GET",
    headers: getHeaders(params),
    redirect: "follow"
  }).then(async response => {
    const jsonResponse = await response.json() as GetProfileResponse;
    return jsonResponse.data;
  });
};

export const grantAccessLevel = async (params: ProfileParams, payload: GrantAccessLevelPayload) => {
  return fetch("https://api.adapty.io/api/v2/server-side-api/purchase/profile/grant/access-level/", {
    method: "POST",
    headers: getHeaders(params),
    body: JSON.stringify(payload),
    redirect: "follow"
  })
    .then(async response => {
      const jsonResponse = await response.json() as GetProfileResponse;
      return jsonResponse.data;
    });
};

export const revokeAccessLevel = async (params: ProfileParams, payload: RevokeAccessLevelPayload) => {
  const requestBody = JSON.stringify({
    access_level_id: payload.access_level_id,
    revoke_at: new Date(Date.now() + 1000).toISOString().replace("Z", "")
  });

  return fetch("https://api.adapty.io/api/v2/server-side-api/purchase/profile/revoke/access-level/", {
    method: "POST",
    headers: getHeaders(params),
    body: requestBody,
    redirect: "follow"
  })
    .then(async response => {
      const text = await response.text();
      const jsonResponse = JSON.parse(text) as GetProfileResponse;
      return jsonResponse.data;
    });
};

export const hasAccessLevel = (profile?: AdaptyProfile) => {
  if (profile === undefined || profile.access_levels === undefined) {
    return false;
  }

  for (const accessLevel of profile.access_levels) {
    if (accessLevel.expires_at === null) {
      return true;
    }

    if (accessLevel.starts_at === null) {
      continue;
    }

    const now = new Date();
    const expiresAt = new Date(accessLevel.expires_at);
    const startsAt = new Date(accessLevel.starts_at);
    if (now >= startsAt && now <= expiresAt) {
      return true;
    }
  }

  return false;
};

export const linkAccessLevel = async (params: ProfileParams, payload: GrantAccessLevelPayload) => {
  const profile = await getProfile(params);
  if (profile == null) {
    throw new Error("Profile not found");
  }

  if (hasAccessLevel(profile)) {
    return profile;
  }

  return grantAccessLevel(params, payload);
};