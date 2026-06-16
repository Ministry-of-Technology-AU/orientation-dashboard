/**
 * src/lib/notion.ts
 *
 * SERVER-ONLY — never import this from a 'use client' component.
 * Use the /api/guides/[id] route to fetch guide content on the client.
 */

import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

// ── Singleton client ──────────────────────────────────────────────────────────

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing NOTION_TOKEN environment variable");
  }
  _client = new Client({
    auth: token,
    fetch: (url, init) => {
      return fetch(url, {
        ...init,
        // Next.js patches fetch; by default it might cache indefinitely.
        // We align the fetch revalidation with the page ISR revalidation.
        next: { revalidate: 60 },
      });
    },
  });
  return _client;
}

function getDbId(): string {
  const id = process.env.NOTION_GUIDES_DB_ID;
  if (!id) {
    throw new Error("Missing NOTION_GUIDES_DB_ID environment variable");
  }
  return id;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GuideMeta {
  /** Notion page ID */
  id: string;
  /** Guide title (from page title property) */
  title: string;
  /** Short nav tab label */
  label: string;
  /** Subtitle shown under the title */
  description: string;
  /** Lucide icon name, e.g. "FileText" */
  iconName: string;
  /** Display order (ascending) */
  order: number;
  /** Cover image URL (from Notion page cover), if set */
  coverImage?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract plain text from a Notion rich_text array */
function richTextToPlain(
  richText: RichTextItemResponse[] | undefined | null
): string {
  if (!richText || richText.length === 0) return "";
  return richText.map((rt) => rt.plain_text).join("");
}

/** Safely extract a rich_text property */
function getRichText(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>,
  key: string
): string {
  const actualKey = Object.keys(props).find(k => k.toLowerCase() === key.toLowerCase());
  if (!actualKey) return "";
  
  const prop = props[actualKey];
  if (!prop || prop.type !== "rich_text") return "";
  return richTextToPlain(prop.rich_text);
}

/** Safely extract a select or text property */
function getSelect(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>,
  key: string
): string {
  // Case-insensitive property lookup just in case they used lowercase "icon"
  const actualKey = Object.keys(props).find(k => k.toLowerCase() === key.toLowerCase());
  if (!actualKey) return "";
  
  const prop = props[actualKey];
  if (!prop) return "";
  
  if (prop.type === "select" && prop.select) {
    return prop.select.name?.trim() ?? "";
  }
  
  if (prop.type === "rich_text") {
    return richTextToPlain(prop.rich_text).trim();
  }
  
  return "";
}

/** Safely extract a number property */
function getNumber(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>,
  key: string,
  fallback = 0
): number {
  const actualKey = Object.keys(props).find(k => k.toLowerCase() === key.toLowerCase());
  if (!actualKey) return fallback;
  
  const prop = props[actualKey];
  if (!prop || prop.type !== "number") return fallback;
  return prop.number ?? fallback;
}

/** Safely extract the page title */
function getTitle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
): string {
  // Notion always exposes the title under a property of type "title"
  const titleProp = Object.values(props).find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p?.type === "title"
  ) as { type: "title"; title: RichTextItemResponse[] } | undefined;
  return richTextToPlain(titleProp?.title);
}

// ── getGuidesMeta ─────────────────────────────────────────────────────────────

/**
 * Fetch all published guide metadata in a single Notion API call.
 * Returns guides sorted by their Order property (ascending).
 */
export async function getGuidesMeta(): Promise<GuideMeta[]> {
  const notion = getClient();
  const dbId = getDbId();

  const response = await notion.dataSources.query({
    data_source_id: dbId,
    filter: {
      property: "Published",
      checkbox: { equals: true },
    },
    sorts: [
      {
        property: "Order",
        direction: "ascending",
      },
    ],
  });

  const guides: GuideMeta[] = [];

  for (const page of response.results) {
    if (page.object !== "page") continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (page as any).properties as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cover = (page as any).cover as any;

    const title = getTitle(props);
    if (!title) continue; // skip pages with no title

    // Extract cover image URL (external or Notion-hosted file)
    let coverImage: string | undefined;
    if (cover) {
      if (cover.type === "external" && cover.external?.url) {
        coverImage = cover.external.url;
      } else if (cover.type === "file" && cover.file?.url) {
        coverImage = cover.file.url;
      }
    }

    guides.push({
      id: page.id,
      title,
      label: getRichText(props, "Label") || title,
      description: getRichText(props, "Description"),
      iconName: getSelect(props, "Icon") || "FileText",
      order: getNumber(props, "Order", guides.length + 1),
      coverImage,
    });
  }

  return guides;
}

// ── getGuideContent ───────────────────────────────────────────────────────────

/** Convert a single Notion block to a markdown fragment */
function blockToMarkdown(block: BlockObjectResponse): string {
  const type = block.type;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (block as any)[type];

  /** Helper: rich_text array → plain string (with basic inline formatting) */
  function richToMd(richText: RichTextItemResponse[] | undefined): string {
    if (!richText) return "";
    return richText
      .map((rt) => {
        let text = rt.plain_text;
        if (rt.annotations.bold) text = `**${text}**`;
        if (rt.annotations.italic) text = `*${text}*`;
        if (rt.annotations.code) text = `\`${text}\``;
        if (rt.annotations.strikethrough) text = `~~${text}~~`;
        if ("href" in rt && rt.href) text = `[${text}](${rt.href})`;
        return text;
      })
      .join("");
  }

  switch (type) {
    case "heading_1":
      return `# ${richToMd(data?.rich_text)}\n`;
    case "heading_2":
      return `## ${richToMd(data?.rich_text)}\n`;
    case "heading_3":
      return `### ${richToMd(data?.rich_text)}\n`;
    case "paragraph": {
      const text = richToMd(data?.rich_text);
      return text ? `${text}\n` : "\n"; // preserve blank lines
    }
    case "bulleted_list_item":
      return `- ${richToMd(data?.rich_text)}\n`;
    case "numbered_list_item":
      // Notion returns individual items; markdown renderers handle numbering
      return `1. ${richToMd(data?.rich_text)}\n`;
    case "quote":
      return `> ${richToMd(data?.rich_text)}\n`;
    case "code": {
      const lang = data?.language ?? "";
      const code = richToMd(data?.rich_text);
      return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }
    case "to_do":
      return `- [${data?.checked ? "x" : " "}] ${richToMd(data?.rich_text)}\n`;
    case "toggle":
      return `▶ **${richToMd(data?.rich_text)}**\n`;
    case "callout": {
      const emoji = data?.icon?.type === "emoji" ? data.icon.emoji : "💡";
      return `> ${emoji} ${richToMd(data?.rich_text)}\n`;
    }
    case "image": {
      const url = data?.type === "external" ? data.external?.url : data?.file?.url;
      if (url) {
        return `![Image](${url})\n`;
      }
      return "";
    }
    case "divider":
      return `---\n`;
    default:
      // Unsupported block types (columns, embeds, etc.) — skip silently
      return "";
  }
}

/**
 * Fetch blocks recursively including child blocks, with appropriate indentation for nested structures.
 */
async function getBlocksContent(notion: Client, blockId: string, depth = 0): Promise<string> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const block of response.results) {
      if ("type" in block) {
        blocks.push(block as BlockObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  const lines: string[] = [];
  const indent = "  ".repeat(depth);

  for (const block of blocks) {
    const md = blockToMarkdown(block);
    if (md) {
      // Indent each non-empty line of the block markdown to preserve nesting
      const indentedMd = md
        .split("\n")
        .map((line) => (line.trim() ? indent + line : ""))
        .join("\n");
      
      lines.push(indentedMd);
    }

    if (block.has_children) {
      const childContent = await getBlocksContent(notion, block.id, depth + 1);
      if (childContent) {
        lines.push(childContent);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Fetch the block children for a single Notion page and convert to markdown.
 * Handles pagination and nested blocks automatically.
 */
export async function getGuideContent(pageId: string): Promise<string> {
  const notion = getClient();
  return getBlocksContent(notion, pageId, 0);
}
