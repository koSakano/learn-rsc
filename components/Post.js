import { readFile } from "fs/promises";
import { throwNotFound } from "../server.js";

export async function Post({ postSlug }) {
    let content;
    try {
        content = await readFile("./posts/" + postSlug + ".txt", "utf8");
    } catch (err) {
        throwNotFound(err);
    }
    return (
      <section>
        <h2>
          <a href={"/" + postSlug}>{postSlug}</a>
        </h2>
        <article>{content}</article>
      </section>
    );
  }