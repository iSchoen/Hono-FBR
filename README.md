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
the library from `https://github.com/iSchoen/Hono-FBR`.

## Usage

```typescript
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { getRoutes } from "https://github.com/iSchoen/Hono-FBR";

const app = new Hono();

app.route(
    "",
    await getRoutes({
        path: Deno.cwd() + "/routes",   // must be an absolute path
    })
)

Deno.serve({ port: 3000 }, app.fetch);
```

### Route Creation

The following folder structure

```
routes
├── page.tsx
├── users
│   ├── page.tsx
│   └── :id
│       └── page.tsx
├── products
│   ├── page.tsx
│   └── :id
│       └── page.tsx
├── contact
│   └── page.tsx
└── about
    └── page.tsx
```

And the following configuration

```typescript
getRoutes({
    path: Deno.cwd() + "/routes",
})
```

Will produce the following routes

```
"/",
"/contact",
"/about",
"/users",
"/users/:id",
"/products",
"/products/:id"
```

> Note that while the examples above use .tsx files, the file based routing is not
> exclusive to jsx!

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

`RoutingConfig`

You can configure how your routes are generated.

```typescript
{
    path: string,
}
```
