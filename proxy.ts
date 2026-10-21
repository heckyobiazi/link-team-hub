import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  function proxy() {},
  {
    // Everything outside these paths requires a signed-in user.
    publicPaths: ["/", "/login", "/signup", "/access-denied"],
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
