import { USER_ROLES } from "@/constants";
import { IRoute } from "@/store/features/route/route.interface";
import { createSlice } from "@reduxjs/toolkit";


const initialState: IRoute[] | null = null;

const routeSlice = createSlice({
  name: "route",
  initialState,
  reducers: {
    print: (state, action) => {
     // console.log("Auth state:", JSON.stringify(state, null, 2));
    },
  },
});

export const { print } = routeSlice.actions;
export default routeSlice.reducer;
