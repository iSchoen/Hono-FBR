import { createFactory, type CreateHandlersInterface } from "hono/factory";

export const createHandler: CreateHandlersInterface<any, any> =
  createFactory().createHandlers;
