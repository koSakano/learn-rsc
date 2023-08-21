import { createServer } from "http";
import { readFile } from "fs/promises";
import { renderToString } from "react-dom/server";

createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname === "/client.js") {
        await sendScript(res, "./client.js");
      }
      // Get the serialized JSX response from the RSC server
      const response = await fetch("http://127.0.0.1:8081" + url.pathname);
      if (!response.ok) {
        res.statusCode = response.status;
        res.end();
        return;
      }
      const clientJSXString = await response.text();
      if (url.searchParams.has("jsx")) {
        // If the user is navigating between pages, send that serialized JSX as is
        res.setHeader("Content-Type", "application/json");
        res.end(clientJSXString);
      } else {
        // If this is an initial page load, revive the tree and turn it into HTML
        const clientJSX = JSON.parse(clientJSXString, parseJSX);
        let html = renderToString(clientJSX);
        html += `<script>window.__INITIAL_CLIENT_JSX_STRING__ = `;
        html += JSON.stringify(clientJSXString).replace(/</g, "\\u003c");
        html += `</script>`;
        // ...
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      }
    } catch (err) {
      throw err;
    }
  }).listen(8080);

async function sendScript(res, filename) {
  const content = await readFile(filename, "utf8");
  res.setHeader("Content-Type", "text/javascript");
  res.end(content);
}

function parseJSX(key, value) {
    if (value === "$RE") {
      return Symbol.for("react.element");
    } else if (typeof value === "string" && value.startsWith("$$")) {
      return value.slice(1);
    } else {
      return value;
    }
  }
  