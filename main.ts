import { compact } from "./utils/compact.ts";
import { flattenList } from "./utils/flattenList.ts";
import { Context, Handler, Hono, isAbsolute } from "./deps.ts";

type RoutingConfig = {
  path: string;
  filePattern: string | RegExp;
  fnPattern: string;
};

type RouteResult = {
  path: string;
  fn: Handler;
};

const getRoutePaths = async (
  routeConfig: RoutingConfig,
): Promise<RouteResult[]> => {
  const { path, filePattern, fnPattern } = routeConfig;

  console.log({ path });

  const routes = Array.from(Deno.readDirSync(path));

  const parsedRoutes = await Promise.all(routes.map(async (r) => {
    if (r.isDirectory) {
      const nestedRoutes = getRoutePaths({
        path: `${path}/${r.name}`,
        filePattern,
        fnPattern,
      });

      return nestedRoutes;
    }

    if (
      (filePattern instanceof RegExp && filePattern.test(r.name)) ||
      r.name === filePattern
    ) {
      const fn = isAbsolute(path)
        ? (await import(`${path}/${r.name}`))[fnPattern]
        : (await import(`${Deno.cwd()}/${path}/${r.name}`))[fnPattern];

      return [{
        path,
        fn: (ctx: Context) => ctx.html(fn(ctx)),
      }];
    }
  }));

  return flattenList(compact(parsedRoutes));
};

export const getRoutes = async (
  routeConfig: RoutingConfig,
) => {
  const { path: rootPath } = routeConfig;

  console.log({ rootPath });

  const routes = await getRoutePaths(routeConfig);

  const finalRoutes = routes.map((r) =>
    r.path === rootPath
      ? { ...r, path: "/" }
      : { ...r, path: r.path.replace(rootPath, "") }
  );

  const app = new Hono();

  for (const finalRoute of finalRoutes) {
    app.get(finalRoute.path, finalRoute.fn);
  }

  return app;
};
