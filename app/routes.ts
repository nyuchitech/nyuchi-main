import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/_index.tsx"),
    route("community", "routes/community.tsx"),
    route("home", "routes/home.tsx"),
    route("admin", "routes/admin.tsx"),
  ]),
  // Auth routes (outside main layout for clean auth flow)
  route("auth/*", "routes/auth.$.tsx"),
  route("auth/signin", "routes/auth.signin.tsx"),
  route("auth/signout", "routes/auth.signout.tsx"),
  route("auth/error", "routes/auth.error.tsx"),
] satisfies RouteConfig;
