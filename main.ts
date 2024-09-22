import { compact } from "./lib/compact.ts";
import { type Env, Hono, type Schema } from "hono";
import { isAbsolute } from "@std/path";
import type { RouteResult, RoutingConfig } from "./lib/types.ts";
import { flattenList } from "./lib/flattenList.ts";

const getRoutePaths = async (
  routeConfig: RoutingConfig,
): Promise<RouteResult[]> => {
  const { path } = routeConfig;

  const routes = Array.from(Deno.readDirSync(path));

  const parsedRoutes = await Promise.all(routes.map(async (r) => {
    if (r.isDirectory) {
      const nestedRoutes = getRoutePaths({
        path: `${path}/${r.name}`,
      });

      return nestedRoutes;
    }

    const route: RouteResult = {
      path,
    };

    await Promise.all([
      import(`file://${path}/get.ts`).then((file) => route.GET = file["GET"])
        .catch(() => {}),

      import(`file://${path}/put.ts`).then((file) => route.PUT = file["PUT"])
        .catch(() => {}),

      import(`file://${path}/post.ts`).then((file) => route.POST = file["POST"])
        .catch(() => {}),

      import(`file://${path}/del.ts`).then((file) => route.DEL = file["DEL"])
        .catch(() => {}),
    ]);

    return [route];
  }));

  return flattenList(compact(parsedRoutes));
};

/**
 * Get routes from a routing configuration
 *
 * @param routeConfig The root path of the routes you want to create with file-based routing
 *
 * @returns The routes to pass into Hono
 *
 * @throws If the path is not absolute
 *
 * @example
 * ```typescript
 *  app.route(
 *    "/v1",
 *    await getRoutes({
 *      path: Deno.cwd() + "/v1",   // must be an absolute path
 *    })
 *  )
 * ```
 */
export const getRoutes = async (
  routeConfig: RoutingConfig,
): Promise<Hono<Env, Schema, "/">> => {
  const { path: rootPath } = routeConfig;

  if (!isAbsolute(rootPath)) {
    throw new Error(`Path ${rootPath} is not absolute`);
  }

  const routes = await getRoutePaths(routeConfig);

  const finalRoutes = routes.map((r) =>
    r.path === rootPath
      ? { ...r, path: "/" }
      : { ...r, path: r.path.replace(rootPath, "") }
  );

  const app = new Hono();

  for (const finalRoute of finalRoutes) {
    const { path, GET, PUT, POST, DEL } = finalRoute;

    GET && app.get(path, ...GET);
    PUT && app.put(path, ...PUT);
    POST && app.post(path, ...POST);
    DEL && app.delete(path, ...DEL);
  }

  return app;
};
