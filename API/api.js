export const API_CONFIG = {
  baseURL: "https://mobile-store.id.vn",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

export const token = localStorage.getItem("token");

const callApi = async (endpoint, method = "GET", options = {}) => {
  try {
    const queryParams = options.params
      ? "?" + new URLSearchParams(options.params).toString()
      : "";

    const url = `${API_CONFIG.baseURL}${endpoint}${queryParams}`;

    const headers = {
      ...API_CONFIG.defaultHeaders,
      ...options.headers,
    };

    const config = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== "GET" && options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawText = await response.text();
    let data;

    try {
      const jsonStartIndex = rawText.indexOf("{");
      if (jsonStartIndex !== -1) {
        const jsonString = rawText.slice(jsonStartIndex);
        data = JSON.parse(jsonString);
      } else {
        throw new Error("Không tìm thấy JSON hợp lệ trong phản hồi.");
      }
    } catch (jsonError) {
      console.error("Lỗi khi phân tích JSON:", jsonError);
      console.error("Raw response:", rawText);
      throw new Error("Phản hồi từ server không phải là JSON hợp lệ.");
    }

    return data;
  } catch (error) {
    console.error("API call failed:", error.message);
    throw error;
  }
};

const apiService = {
  get: (endpoint, params = {}, headers = {}) => {
    return callApi(endpoint, "GET", { params, headers });
  },

  post: (endpoint, body = {}, params = {}, headers = {}) => {
    return callApi(endpoint, "POST", { body, params, headers });
  },
};

export default apiService;
