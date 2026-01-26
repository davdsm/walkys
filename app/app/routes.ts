import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/:mode", "routes/auth.$mode.tsx"),
  route("collection/:collection", "routes/collection.$collection.tsx"),
  route("category/:category", "routes/category.$category.tsx"),
  route("product/:product", "routes/product.$product.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password/:token", "routes/reset-password.$token.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("about", "routes/about.tsx"),
  route("terms", "routes/terms.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("contact", "routes/contact.tsx"),
  route("logout", "routes/logout.tsx"),
  route("orders", "routes/orders.tsx"),
  route("catalog", "routes/catalog.tsx"),
] satisfies RouteConfig;
