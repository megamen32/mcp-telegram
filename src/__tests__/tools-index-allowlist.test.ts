import assert from "node:assert";
import { describe, it } from "node:test";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TelegramService } from "../telegram-client.js";
import { registerTools } from "../tools/index.js";

const EXPECTED_TOOL_NAMES = [
  "telegram-status",
  "telegram-login",
  "telegram-logout",
  "telegram-list-chats",
  "telegram-read-messages",
  "telegram-get-unread",
  "telegram-send-message",
  "telegram-download-media",
];

describe("registerTools allowlist", () => {
  it("suppresses every non-allowlisted registration", () => {
    const registered: string[] = [];

    const server = {
      registerTool(name: string, _schema: unknown, _handler: unknown) {
        registered.push(name);
      },
    } as unknown as McpServer;

    registerTools(server, {} as TelegramService);

    assert.strictEqual(new Set(registered).size, EXPECTED_TOOL_NAMES.length, "duplicate tools were registered");
    assert.deepStrictEqual(
      [...registered].sort((a, b) => a.localeCompare(b)),
      [...EXPECTED_TOOL_NAMES].sort((a, b) => a.localeCompare(b)),
      "registerTools should expose only the minimal public surface",
    );
  });
});
