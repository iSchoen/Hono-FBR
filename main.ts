import { compact } from "./utils/compact.ts";
import { flattenList } from "./utils/flattenList.ts";
import {
  Context,
  Handler,
  Hono,
  isAbsolute,
  MiddlewareHandler,
} from "./deps.ts";

type RoutingConfig = {
  path: string;
};

type RouteResult = {
  path: string;
  GET?: { validators: MiddlewareHandler[]; handler: Handler };
  PUT?: { validators: MiddlewareHandler[]; handler: Handler };
  POST?: { validators: MiddlewareHandler[]; handler: Handler };
  DELETE?: { validators: MiddlewareHandler[]; handler: Handler };
};

const getRoutePaths = async (
  routeConfig: RoutingConfig,
): Promise<RouteResult[]> => {
  const { path } = routeConfig;

  const routes = Array.from(Deno.readDirSync(path));

  if (
    routes.some((r) => r.name === "page.tsx" || r.name === "page.ts") &&
    routes.some((r) => r.name === "route.ts" || r.name === "route.tsx")
  ) {
    throw new Error(
      `Route ${path} has both page.ts(x) and route.ts(x) files. Please remove one.`,
    );
  }

  const parsedRoutes = await Promise.all(routes.map(async (r) => {
    if (r.isDirectory) {
      const nestedRoutes = getRoutePaths({
        path: `${path}/${r.name}`,
      });

      return nestedRoutes;
    }

    const file = await import(`file://${path}/${r.name}`);

    if (r.name === "page.ts" || r.name === "page.tsx") {
      const PAGE = file["default"];
      const PAGE_VALIDATORS = file["PAGE_VALIDATORS"] ?? [];

      console.log({ PAGE });

      return [{
        path,
        GET: PAGE
          ? {
            validators: PAGE_VALIDATORS,
            handler: (ctx: Context) => PAGE(ctx),
          }
          : undefined,
      }];
    }

    if (r.name === "route.ts" || r.name === "route.tsx") {
      const GET = file["GET"];
      const GET_VALIDATORS = file["GET_VALIDATORS"] ?? [];
      const PUT = file["PUT"];
      const PUT_VALIDATORS = file["PUT_VALIDATORS"] ?? [];
      const POST = file["POST"];
      const POST_VALIDATORS = file["POST_VALIDATORS"] ?? [];
      const DELETE = file["DELETE"];
      const DELETE_VALIDATORS = file["DELETE_VALIDATORS"] ?? [];

      return [{
        path,
        GET: GET
          ? {
            validators: GET_VALIDATORS,
            handler: (ctx: Context) => GET(ctx),
          }
          : undefined,
        PUT: PUT
          ? {
            validators: PUT_VALIDATORS,
            handler: (ctx: Context) => PUT(ctx),
          }
          : undefined,
        POST: POST
          ? {
            validators: POST_VALIDATORS,
            handler: (ctx: Context) => POST(ctx),
          }
          : undefined,
        DELETE: DELETE
          ? {
            validators: DELETE_VALIDATORS,
            handler: (ctx: Context) => DELETE(ctx),
          }
          : undefined,
      }];
    }
  }));

  return flattenList(compact(parsedRoutes));
};

export const getRoutes = async (
  routeConfig: RoutingConfig,
) => {
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
    const { path, GET, PUT, POST, DELETE } = finalRoute;

    GET && app.get(path, ...GET.validators, GET.handler);
    PUT && app.put(path, ...PUT.validators, PUT.handler);
    POST && app.post(path, ...POST.validators, POST.handler);
    DELETE && app.delete(path, ...DELETE.validators, DELETE.handler);
  }

  return app;
};

const app = new Hono();

app.route(
  "",
  await getRoutes({
    path: Deno.cwd() + "/routes",
  }),
);

Deno.serve({ port: 3000 }, app.fetch);
