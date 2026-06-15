import { RouteModel } from "./route.model";
import ApiError from "../../../errors/ApiError";
import { IRoute } from "./route.interface";

const create = async (route: IRoute): Promise<IRoute> => {
  const newRoute = await RouteModel.create(route);
  return newRoute;
};

const getRoutes = async (): Promise<IRoute[]> => {
  const routes = await RouteModel.find();
  return routes;
};

const updateRoute = async (routeId: string, routeData: Partial<IRoute>): Promise<IRoute> => {
  const updatedRoute = await RouteModel.findByIdAndUpdate(routeId, { $set: routeData }, { new: true });
  if (!updatedRoute) {
    throw ApiError.notFound("Route not found");
  }
  return updatedRoute;
};

const deleteRoute = async (routeId: string): Promise<IRoute> => {
  const deletedRoute = await RouteModel.findById(routeId);
  if (!deletedRoute) {
    throw ApiError.notFound("Route not found");
  }
  if (deletedRoute.assignedBuses && deletedRoute.assignedBuses.length > 0) {
    throw ApiError.forbidden("Cannot delete route with assigned buses");
  }

  await RouteModel.findByIdAndDelete(routeId);
  return deletedRoute;
};

export const RouteService = {
  create,
  getRoutes,
  updateRoute,
  deleteRoute,
};
