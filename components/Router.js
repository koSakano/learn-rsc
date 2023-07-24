import { BlogLayout } from "./BaseLayout.js";
import { BlogIndexPage } from "./BlogIndexPage.js";
import { BlogPostPage } from "./BlogPostPage.js";
import sanitizeFilename from "sanitize-filename";

export function Router({ url }) {
  let page;
  if (url.pathname === "/") {
    page = <BlogIndexPage />;
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1));
    page = <BlogPostPage postSlug={postSlug} />;
  }
  return <BlogLayout>{page}</BlogLayout>;
}