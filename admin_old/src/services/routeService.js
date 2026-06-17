import apiClient from "../config/axiosConfig";
export const getAllRoutes = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/v1/routes");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Res", data);
        return data;
    } catch (error) {
        console.log(error);
    }
};
