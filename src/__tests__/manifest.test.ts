import assert from "node:assert";
import { describe, it } from "node:test";
import { _resetManifestCache, getToolManifest } from "../manifest.js";

describe("getToolManifest", () => {
  const manifest = getToolManifest();
  const expectedToolNames = [
    "telegram-download-media",
    "telegram-get-unread",
    "telegram-list-chats",
    "telegram-login",
    "telegram-logout",
    "telegram-read-messages",
    "telegram-send-message",
    "telegram-status",
  ];

  it("registers exactly the minimal public catalog", () => {
    assert.strictEqual(manifest.toolCount, expectedToolNames.length);
    assert.strictEqual(manifest.toolCount, manifest.tools.length);
    assert.deepStrictEqual(manifest.tools.map((tool) => tool.name), expectedToolNames);
  });

  it("reports tier breakdown that sums to toolCount", () => {
    const sum = manifest.tiers["read-only"] + manifest.tiers.write + manifest.tiers.destructive;
    assert.strictEqual(sum, manifest.toolCount);
  });

  it("has tools in every tier", () => {
    assert.ok(manifest.tiers["read-only"] > 0, "no read-only tools");
    assert.ok(manifest.tiers.write > 0, "no write tools");
    assert.ok(manifest.tiers.destructive > 0, "no destructive tools");
  });

  it("returns a stable cached manifest across calls (no env race)", () => {
    const a = getToolManifest();
    const b = getToolManifest();
    assert.strictEqual(a, b, "expected cached identity");
  });

  it("returns tools sorted by name", () => {
    const names = manifest.tools.map((t) => t.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    assert.deepStrictEqual(names, sorted);
  });

  it("classifies known read-only tools correctly", () => {
    const status = manifest.tools.find((t) => t.name === "telegram-status");
    assert.ok(status, "telegram-status not found");
    assert.strictEqual(status.tier, "read-only");
  });

  it("classifies known destructive tools correctly", () => {
    const logout = manifest.tools.find((t) => t.name === "telegram-logout");
    assert.ok(logout, "telegram-logout not found");
    assert.strictEqual(logout.tier, "destructive");
  });

  it("classifies known write tools correctly", () => {
    const sendMessage = manifest.tools.find((t) => t.name === "telegram-send-message");
    assert.ok(sendMessage, "telegram-send-message not found");
    assert.strictEqual(sendMessage.tier, "write");
  });

  it("does not expose tools outside the public allowlist", () => {
    for (const name of [
      "telegram-delete-message",
      "telegram-get-stars-status",
      "telegram-get-group-call",
      "telegram-get-quick-replies",
    ]) {
      assert.ok(!manifest.tools.some((tool) => tool.name === name), `${name} should be private`);
    }
  });

  it("does not leak forced env flags after invocation", () => {
    const original = process.env.MCP_TELEGRAM_ENABLE_STARS;
    delete process.env.MCP_TELEGRAM_ENABLE_STARS;
    try {
      _resetManifestCache();
      getToolManifest();
      assert.strictEqual(process.env.MCP_TELEGRAM_ENABLE_STARS, undefined);
    } finally {
      if (original === undefined) delete process.env.MCP_TELEGRAM_ENABLE_STARS;
      else process.env.MCP_TELEGRAM_ENABLE_STARS = original;
    }
  });

  it("preserves pre-set env flags after invocation", () => {
    const original = process.env.MCP_TELEGRAM_ENABLE_STARS;
    process.env.MCP_TELEGRAM_ENABLE_STARS = "0";
    try {
      _resetManifestCache();
      getToolManifest();
      assert.strictEqual(process.env.MCP_TELEGRAM_ENABLE_STARS, "0");
    } finally {
      if (original === undefined) delete process.env.MCP_TELEGRAM_ENABLE_STARS;
      else process.env.MCP_TELEGRAM_ENABLE_STARS = original;
    }
  });

  it("emits a parseable ISO timestamp", () => {
    assert.ok(!Number.isNaN(Date.parse(manifest.generatedAt)));
  });

  it("every entry has a non-empty name", () => {
    for (const tool of manifest.tools) {
      assert.ok(tool.name.length > 0, `empty name: ${JSON.stringify(tool)}`);
      assert.ok(tool.name.startsWith("telegram-"), `unexpected prefix: ${tool.name}`);
    }
  });
});
