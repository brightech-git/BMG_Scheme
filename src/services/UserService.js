import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://akj.brightechsoftware.com/api/v1";

// Get auth headers dynamically
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Unified fetch wrapper
// requireAuth = true → includes Authorization header
const request = async (url, options = {}, requireAuth = true) => {
  let headers = { "Content-Type": "application/json", ...options.headers };

  if (requireAuth) {
    const authHeader = await getAuthHeader();
    headers = { ...headers, ...authHeader };
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || "Something went wrong",
        status: response.status,
        details: data,
      };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Network error" };
  }
};

const userService = {
  // ---------------- Public APIs ----------------
  registerUser: async (userData) => {
    return request(
      `${API_BASE_URL}/user/register`,
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
      false // ❌ no auth header
    );
  },

  verifyOtp: async (contactNumber, otp) => {
    const params = new URLSearchParams({ contactNumber, otp });
    return request(
      `${API_BASE_URL}/user/verify-otp?${params.toString()}`,
      { method: "POST" },
      false // ❌ no auth header
    );
  },

  loginUser: async (credentials) => {
    const res = await request(
      `${API_BASE_URL}/user/login`,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      false // ❌ no auth header
    );

    if (res.success && res.data?.token) {
      await AsyncStorage.setItem("authToken", res.data.token);
    }

    return res;
  },

  forgotPassword: async (data) => {
    return request(
      `${API_BASE_URL}/user/forgot-password`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false // ❌ no auth header
    );
  },

  resetPassword: async (data) => {
    return request(
      `${API_BASE_URL}/user/reset-password`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false // ❌ no auth header
    );
  },

  // ---------------- Authenticated APIs ----------------
  getUserById: async (id) => {
    return request(`${API_BASE_URL}/user/getUserMasterDataById/${id}`);
  },

  getProfile: async () => {
    return request(`${API_BASE_URL}/user/profile`);
  },
};

export default userService;
