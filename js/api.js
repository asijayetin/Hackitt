const API_URL = "https://hackitt-api.onrender.com/api";

async function apiRequest(path, options) {
    const requestOptions = options || {};
    const headers = requestOptions.headers || {};
    headers["Content-Type"] = "application/json";

    const token = sessionStorage.getItem("hackittToken");
    if (token) headers.Authorization = "Bearer " + token;

    const response = await fetch(API_URL + path, { ...requestOptions, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
}

function saveLogin(data) {
    sessionStorage.setItem("hackittToken", data.token);
    sessionStorage.setItem("currentUser", JSON.stringify(data.user));
}
