import { createFactory, type CreateHandlersInterface } from "hono/factory";

/**
 * Create a handler for a route
 *
 * @param ...args Hono handler, middleware, or validators
 *
 * @returns The handler
 *
 * @example
 * ```typescript
 *  export const GET = createHandler(
 *    (ctx) => {
 *      return ctx.json({
 *        message: "Hello, World!",
 *      });
 *    },
 *  );
 * ```
 */
export const createHandler: CreateHandlersInterface<any, any> =
  createFactory().createHandlers;
