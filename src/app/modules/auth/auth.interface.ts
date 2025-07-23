import { Schema } from "mongoose";
import { USER_ROLES } from "../../../constants";

export interface IUser{
    name: string;
    email: string;
    role: USER_ROLES.ADMIN | USER_ROLES.EMPLOYEE | USER_ROLES.STUDENT | USER_ROLES.SUPER_ADMIN;
    password: string;
    phoneNumber: string;
    houseLocation: {
        latitude: number;
        longitude: number;
    };
    routeId: Schema.Types.ObjectId;
}