import { FastMCP } from "fastmcp";
import { registerTools } from "../core/tools.js";
// import { registerPrompts } from "../core/prompts.js";
// import { registerResources } from "../core/resources.js";


// Create and start the MCP server
async function startServer() {
  try {
    // Create a new FastMCP server instance
    const server = new FastMCP({
      name: "Color Format Converter MCP Server",
      instructions: "This is a MCP server that converts colors from one format to another, It supports the following formats: RGB, HEX, HSL OKLCH, LAB and CMYK.",
      version: "1.0.0"
    });

    // Register all resources, tools, and prompts
    // registerResources(server);
    registerTools(server);
    // registerPrompts(server);
    
    // Log server information
    console.error(`Color Format Converter MCP Server initialized`);
    console.error("Color Format Converter Server is ready to handle requests");
    
    return server;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

// Export the server creation function
export default startServer; 