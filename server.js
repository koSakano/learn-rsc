import { createServer } from "http";
import { readFile, readdir } from "fs/promises";
import escapeHtml from "escape-html";
import { BlogLayout } from "./components/BaseLayout.js";
import { BlogIndexPage } from "./components/BlogIndexPage.js";
import { BlogPostPage } from "./components/BlogPostPage.js";

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/') {
      const postFiles = await readdir("./posts");
      const postSlugs = postFiles.map((file) => file.slice(0, file.lastIndexOf(".")));
      const postContents = await Promise.all(
        postSlugs.map((postSlug) =>
          readFile("./posts/" + postSlug + ".txt", "utf8")
        )
      );
      sendHTML(res, <BlogLayout><BlogIndexPage postSlugs={postSlugs} postContents={postContents} /></BlogLayout>);
    } else if ((/^\/[a-zA-Z0-9-]+$/).test(url.pathname)) {
      try {
        const postSlug = url.pathname.slice(1);
        const postContent = await readFile("./posts/" + postSlug + ".txt", "utf8");
        sendHTML(res, <BlogLayout><BlogPostPage postSlug={postSlug} postContent={postContent} /></BlogLayout>);
      } catch (err) {
        throwNotFound(err);
      }
    } else {
      console.log(url);
      throwNotFound();
    }
  } catch (err) {
    console.error(err);
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(8080);


function sendHTML(res, jsx) {
  const html = renderJSXToHTML(jsx);
  res.setHeader("Content-Type", "text/html");
  res.end(html);
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause });
  notFound.statusCode = 404;
  throw notFound;
}

function renderJSXToHTML(jsx) {
  if (typeof jsx === "string" || typeof jsx === "number") {
    return escapeHtml(jsx);
  } else if (jsx == null || typeof jsx === "boolean") {
    return "";
  } else if (Array.isArray(jsx)) {
    return jsx.map((child) => renderJSXToHTML(child)).join("");
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (typeof jsx.type === "string") {
        let html = "<" + jsx.type;
        for (const propName in jsx.props) {
          if (jsx.props.hasOwnProperty(propName) && propName !== "children") {
            html += " ";
            html += propName;
            html += "=";
            html += escapeHtml(jsx.props[propName]);
          }
        }
        html += ">";
        html += renderJSXToHTML(jsx.props.children);
        html += "</" + jsx.type + ">";
        return html;
      } else {
        return renderJSXToHTML(jsx.type(jsx.props));
      }
    } else throw new Error("Cannot render an object.");
  } else throw new Error("Not implemented.");
}
