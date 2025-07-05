# color-convert-mcp

A robust, extensible MCP server for color conversion between multiple color spaces, including RGB, RGBA, HEX, HSL, OKLCH, LAB, and CMYK. Built with FastMCP and TypeScript, this server provides accurate color conversions and is fully tested with a comprehensive suite.

---

## 🤖 What is MCP?

**MCP (Model Context Protocol)** is an open protocol that lets AI models connect to external tools, data, and systems—like giving your AI a "superpower plug."

- **Why?** Most LLMs (like Claude, GPT, Qwen) can only chat. MCP lets them actually _do things_: fetch data, run code, automate tasks, and interact with your apps.
- **How?** MCP servers expose tools (functions), resources (data), and prompts (templates) that AI clients can call.
- **Example:** With an MCP server, your AI can convert colors, send Slack messages, query databases, or even build 3D models—right from your chat or IDE.

### 🧩 Popular MCP Clients
- **Claude Desktop**: Official Anthropic client, easy for everyone.
- **Cherry Studio**: Visual configuration, beginner-friendly.
- **5ire**: Modern AI assistant, supports many providers and platforms.
- **Cursor**: Code editor with MCP integration for developers.
- **DeepChat**: Multi-model AI assistant with MCP support.

> For a Chinese-language introduction and more resources, see [Awesome-MCP-ZH](https://github.com/yzfly/Awesome-MCP-ZH).

---

## 📚 Learn More
- [MCP Official Site](https://modelcontextprotocol.io/introduction)
- [Anthropic MCP Announcement](https://www.anthropic.com/news/model-context-protocol)
- [Awesome-MCP-ZH (中文)](https://github.com/yzfly/Awesome-MCP-ZH)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

---

## 🎨 Features
- **Color Conversion Service**: Convert colors between RGB, RGBA, HEX (6/8 digit), HSL, OKLCH, LAB, and CMYK.
- **Robust Parsing**: Supports percent, decimals, and out-of-range values for all color spaces.
- **Precision Handling**: Uses tolerant numeric comparison for floating-point color values.
- **API Ready**: Easily integrate as an MCP server in your workflow or as a backend service.
- **Tested**: 20+ tests covering all color spaces and edge cases.

---

### Running the MCP Server

You can run the MCP server in stdio (CLI) mode:

#### stdio Transport (CLI Mode)

Start the server in stdio mode for CLI tools:

```bash
pnpm start
# or
npm start
yarn start
bun start
```

By default, the server runs in stdio mode for local CLI/MCP integration.

---

## 🖥️ Connecting to Claude for Desktop (or other MCP clients)

You can connect this MCP server to Claude for Desktop or any other MCP-compatible client.

### Claude for Desktop Configuration

1. Open your Claude for Desktop configuration file:
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%AppData%\Claude\claude_desktop_config.json`

2. Add your server to the `mcpServers` section. Example for stdio mode:

```json
{
  "mcpServers": {
    "color-convert-mcp": {
      "command": "pnpm",
      "args": ["start"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

3. Save the file and restart Claude for Desktop.

> For more details, see the [official MCP server quickstart guide](https://modelcontextprotocol.io/quickstart/server#claude-for-desktop-integration-issues).

---
