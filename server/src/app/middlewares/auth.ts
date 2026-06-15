import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../helper/jwtHelper";

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      console.log("token", token);
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }
      // verify token
      let verifiedUser = null;

      try {
        verifiedUser = jwtHelpers.verifyToken(token.split(" ")[1], config.JWT.ACCESS_TOKEN_SECRET as Secret);
      } catch (error) {
        // Token verification failed
        return next(new ApiError(StatusCodes.UNAUTHORIZED, "INVALID_ACCESS_TOKEN"));
      }

      req.user = verifiedUser; // role  , userid
      console.log("verifiedUser", verifiedUser);
      // print issue time and expiration time
      console.log(new Date(verifiedUser.iat * 1000));
      console.log(new Date(verifiedUser.exp * 1000));

      // role diye guard korar jnno
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
