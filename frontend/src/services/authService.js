const API_URL = "http://localhost:5000/api/users";

const ACTIVE_TOKEN_KEY = "goviToken";
const ACTIVE_USER_KEY = "goviUser";

const getSessionKeys = (role) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "consumer") {
    return {
      token: "goviConsumerToken",
      user: "goviConsumerUser",
    };
  }

  if (normalizedRole === "farmer") {
    return {
      token: "goviFarmerToken",
      user: "goviFarmerUser",
    };
  }

  if (normalizedRole === "admin") {
    return {
      token: "goviAdminToken",
      user: "goviAdminUser",
    };
  }

  throw new Error("Invalid account role.");
};

const saveRoleSession = (user, token) => {
  if (!user || !token || !user.role) {
    throw new Error("The server did not return a valid login session.");
  }

  const role = user.role.toLowerCase();
  const keys = getSessionKeys(role);

  localStorage.setItem(keys.token, token);
  localStorage.setItem(keys.user, JSON.stringify(user));

  sessionStorage.setItem(ACTIVE_TOKEN_KEY, token);
  sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
};

const getToken = () => {
  const token = sessionStorage.getItem(ACTIVE_TOKEN_KEY);

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  return token;
};

const parseResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

export const registerUser = async (formData) => {
  const role = String(formData.role || "").toLowerCase();

  if (!["consumer", "farmer"].includes(role)) {
    throw new Error("Only consumer and farmer registration is allowed.");
  }

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...formData, role }),
  });

  const data = await parseResponse(response, "Registration failed.");

  if (data.token && data.user) {
    saveRoleSession(data.user, data.token);
  }

  return data;
};

export const loginUser = async (username, password, role) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (!["consumer", "farmer", "admin"].includes(normalizedRole)) {
    throw new Error("Invalid account type.");
  }

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      role: normalizedRole,
    }),
  });

  const data = await parseResponse(response, "Login failed.");

  if (!data.token || !data.user) {
    throw new Error("The server did not return a valid login session.");
  }

  if (data.user.role?.toLowerCase() !== normalizedRole) {
    throw new Error("The account role does not match the selected role.");
  }

  saveRoleSession(data.user, data.token);

  return data;
};

export const getMyProfile = async () => {
  const token = getToken();

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse(
    response,
    "Unable to load your profile."
  );

  if (data.user) {
    sessionStorage.setItem(
      ACTIVE_USER_KEY,
      JSON.stringify(data.user)
    );

    const keys = getSessionKeys(data.user.role);

    localStorage.setItem(keys.user, JSON.stringify(data.user));
  }

  return data.user;
};

export const updateMyProfile = async (profileData) => {
  const token = getToken();

  const response = await fetch(`${API_URL}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await parseResponse(
    response,
    "Unable to update your profile."
  );

  if (data.user) {
    sessionStorage.setItem(
      ACTIVE_USER_KEY,
      JSON.stringify(data.user)
    );

    const keys = getSessionKeys(data.user.role);

    localStorage.setItem(keys.user, JSON.stringify(data.user));
  }

  return data;
};

export const switchRoleSession = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  const keys = getSessionKeys(normalizedRole);

  const token = localStorage.getItem(keys.token);
  const userText = localStorage.getItem(keys.user);

  if (!token || !userText) {
    throw new Error(
      `No saved ${normalizedRole} session was found. Please log in.`
    );
  }

  const user = JSON.parse(userText);

  if (user.role?.toLowerCase() !== normalizedRole) {
    throw new Error("The saved account role does not match.");
  }

  sessionStorage.setItem(ACTIVE_TOKEN_KEY, token);
  sessionStorage.setItem(ACTIVE_USER_KEY, userText);

  return user;
};

export const logoutUser = () => {

  sessionStorage.removeItem(ACTIVE_TOKEN_KEY);
  sessionStorage.removeItem(ACTIVE_USER_KEY);
};
