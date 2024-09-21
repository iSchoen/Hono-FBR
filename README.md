# Hono FBR

Hono FBR is a lightweight, yet powerful addition to the [Hono](hono.dev) framework, designed to streamline
the creation and management of routes through an intuitive file-based system. This library simplifies
the process of defining routes, offering developers a more organized and scalable approach to
handling web application endpoints, ultimately making the development process quicker, cleaner,
and more intuitive. And with Hono's routing, this is all done blazingly fast!

## Motivation

The idea behind Hono FBR is simple: make routing less of a headache in your SSR Hono app. As projects
grow, managing routes traditionally becomes messy and confusing. This library introduces an
entirely configurable, organized, file-based approach to tackle this issue head-on. This way,
developers can quickly find and manage routes, making the development process smoother and more
enjoyable. Hono FBR takes a great part of many modern frontend frameworks, and brings its simplicity
to the backend, so you can focus on building great software.

## What is file based routing?

File-based routing is all about organizing your web app's routes using a straightforward,
folder-and-file system. In file-based routing, each part of your app's URL corresponds to a specific file
or folder in your project. Instead of writing complex routing rules, you just create a new file or
folder, and voila — your app knows where to go when someone visits that path. It's intuitive, clean,
and means less time coding routing logic and more time making your app awesome.

## Getting Started

Hono FBR is specifically built for use with Deno. As such, you can use the library by simply importing
the library from `jsr:@inventus/hono-fbr`.

## Usage

```typescript
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { getRoutes } from "https://github.com/iSchoen/Hono-FBR";

const app = new Hono();

app.route(
    "/v1",
    await getRoutes({
        path: Deno.cwd() + "/v1",   // must be an absolute path
    })
)

Deno.serve({ port: 3000 }, app.fetch);
```

### Route Creation

The following folder structure

```
routes
├── users
│   ├── get.ts
│   ├── put.ts
│   ├── post.ts
│   └── :id
│       ├── get.ts
│       ├── put.ts
│       ├── post.ts
│       └── del.ts
└── products
    ├── get.ts
    ├── put.ts
    ├── post.ts
    └── :id
        ├── get.ts
        ├── put.ts
        ├── post.ts
        └── del.ts
```

And the following configuration

```typescript
getRoutes({
    path: Deno.cwd() + "/v1",
})
```

Will produce the following routes

```
"/users"        (GET, PUT, POST),
"/users/:id"    (GET, PUT, POST, DELETE),
"/products"     (GET, PUT, POST),
"/products/:id" (GET, PUT, POST, DELETE)
```

### Route Files

Hono FBR uses the file system to define routes. Each file in the routes directory
represents a route. The name of the file is the HTTP method that the route will
respond to. The contents of the file is the route function.

For example, the file `get.ts` in the `users` directory would represent a `GET`
route to `/users`.

```typescript
export const GET = createHandler(
	(ctx) => {
		return ctx.json({
			message: "Hello, World!",
		});
	},
);
```

All features of Hono are available in route files, including middleware, context
access, and more.

```typescript
export const GET = createHandler(
	validator("param", (value, c) => {
		if (value.id === undefined) {
			return c.json({
				message: "Invalid param",
			});
		}

		return {
			id: paramParse.data.id,
		};
	}),
    (ctx) => {
        return ctx.json({
            message: "Hello, World!",
        });
    },
);
```

### Dynamic Routes

In Hono, the part of the request URL prefixed with `:` is dynamic. This means that
the route is passed in a parameter value that is dependent on the actual URL that
matched to the dynamic route.

For example, a request to `/products/10` would match to the `/products/:id` route
and the route function would be provided Hono's context object where the value
at `context.req.param("id")` would be `10`.

## API Reference

`getRoutes`

Generates all routes for Hono to match to. Returns a promise.

```typescript
const app = new Hono();

app.route(
  "",
  await getRoutes({
    path: Deno.cwd() + "/routes",
  }),
);
```

`Fn createHandler`

A function that creates a handler for a route.

```typescript
export const GET = createHandler(
	(ctx) => {
		return ctx.json({
			message: "Hello, World!",
		});
	},
);
```
