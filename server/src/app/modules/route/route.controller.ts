import { Request, Response } from "express";
import { RouteService } from "./route.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IRoute } from "./route.interface";

const addRoute = async (req: Request, res: Response) => {
  const routeData: IRoute = req.body;
  const newRoute = await RouteService.create(routeData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Route created successfully",
    data: newRoute,
  });
};
const getRoutes = async (req: Request, res: Response) => {
  const routes = await RouteService.getRoutes();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Routes fetches successfully",
    data: routes,
  });
};
const updateRoute = async (req: Request, res: Response) => {
  const routeId = req.params.id;
  if (!routeId) throw ApiError.badRequest("Route ID is required");

  const routes = await RouteService.updateRoute(routeId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Route updated successfully",
    data: routes,
  });
};

const deleteRoute = async (req: Request, res: Response) => {
  const routeId = req.params.id;
  if (!routeId) throw ApiError.badRequest("Route ID is required");
  const route = await RouteService.deleteRoute(routeId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Routes fetches successfully",
    data: route,
  });
};

export const RouteController = {
  addRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
};
