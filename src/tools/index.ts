import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TelegramService } from "../telegram-client.js";
import { registerAccountTools } from "./account.js";
import { registerAuthTools } from "./auth.js";
import { registerBoostTools } from "./boosts.js";
import { registerBusinessTools } from "./business.js";
import { registerChatTools } from "./chats.js";
import { registerContactTools } from "./contacts.js";
import { registerExtraTools } from "./extras.js";
import { registerFactCheckTools } from "./fact-check.js";
import { registerFolderTools } from "./folders.js";
import { registerGroupCallTools } from "./group-calls.js";
import { registerMediaTools } from "./media.js";
import { registerMessageTools } from "./messages.js";
import { registerQuickRepliesTools } from "./quick-replies.js";
import { registerReactionTools } from "./reactions.js";
import { registerSendMediaTools } from "./send-media.js";
import { registerStarsTools } from "./stars.js";
import { registerStickerTools } from "./stickers.js";
import { registerStoryTools } from "./stories.js";
import { registerTranscribeTools } from "./transcribe.js";

const ALLOWED_TOOL_NAMES = new Set([
  "telegram-status",
  "telegram-login",
  "telegram-logout",
  "telegram-list-chats",
  "telegram-read-messages",
  "telegram-get-unread",
  "telegram-send-message",
  "telegram-download-media",
]);

function createAllowlistedServer(server: McpServer): McpServer {
  return {
    registerTool(name, schema, handler) {
      if (!ALLOWED_TOOL_NAMES.has(name)) {
        return undefined;
      }
      return server.registerTool(name, schema, handler);
    },
  } as McpServer;
}

export function registerTools(server: McpServer, telegram: TelegramService) {
  const allowlistedServer = createAllowlistedServer(server);

  registerAuthTools(allowlistedServer, telegram);
  registerMessageTools(allowlistedServer, telegram);
  registerChatTools(allowlistedServer, telegram);
  registerMediaTools(allowlistedServer, telegram);
  registerSendMediaTools(allowlistedServer, telegram);
  registerContactTools(allowlistedServer, telegram);
  registerReactionTools(allowlistedServer, telegram);
  registerTranscribeTools(allowlistedServer, telegram);
  registerFactCheckTools(allowlistedServer, telegram);
  registerExtraTools(allowlistedServer, telegram);
  registerAccountTools(allowlistedServer, telegram);
  registerBusinessTools(allowlistedServer, telegram);
  registerFolderTools(allowlistedServer, telegram);
  registerStickerTools(allowlistedServer, telegram);
  registerStoryTools(allowlistedServer, telegram);
  registerBoostTools(allowlistedServer, telegram);
  registerGroupCallTools(allowlistedServer, telegram);
  registerStarsTools(allowlistedServer, telegram);
  registerQuickRepliesTools(allowlistedServer, telegram);
}
