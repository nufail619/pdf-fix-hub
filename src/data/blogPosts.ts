import { publishedContent } from "@/generated/content";
import type { Article } from "./article";
export type BlogPost = Article;
export const blogPosts: Article[] = publishedContent.blog;
