import { Post } from './Post.js';

export function BlogPostPage({ postSlug }) {
  return (
    <Post postSlug={postSlug} />
  );
}