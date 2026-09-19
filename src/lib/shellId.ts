/**
 * Build-time id of the single exported shell page for a dynamic route.
 * CloudFront rewrites every real `/product/<id>` and `/account/orders/<id>`
 * onto that shell, so the route param is never a real id. Product and order
 * ids are 24-character hex ObjectIds, so a double-underscored word cannot
 * collide with one.
 *
 * Kept apart from `routeId.ts` because both graphs need it: the route
 * `page.tsx` files are server components that pass it to generateStaticParams,
 * while `useRouteId` compares against it in the browser. A `"use client"`
 * module hands a server importer a module reference instead of the value, so
 * the constant has to sit on this side of the boundary.
 */
export const SHELL_ID = "__shell__";
