import type { createHandler } from "./utils/createHandler.ts";

export type RoutingConfig = {
  path: string;
};

export type RouteResult = {
  path: string;
  GET?: ReturnType<typeof createHandler>;
  PUT?: ReturnType<typeof createHandler>;
  POST?: ReturnType<typeof createHandler>;
  DEL?: ReturnType<typeof createHandler>;
};
