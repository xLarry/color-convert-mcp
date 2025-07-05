import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as services from "./services/index.js";

/**
 * Register all tools with the MCP server
 * 
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP) {
  // Greeting tool
  server.addTool({
    name: "convert_color",
    description: "A tool that converts colors from one format to another, It supports the following formats: RGB, HEX, HSL, OKLCH, LAB and CMYK",
    parameters: z.object({
      from: z.string().describe("The format to convert from"),
      to: z.string().describe("The format to convert to"),
      color: z.string().describe("The color to convert")
    }),
    execute: async (params) => {
      try{
        const convertedColor = services.ColorConvertService.convertColor(params.from, params.to, params.color);
        return {
          content: [
            {
              text: convertedColor,
              type: "text"
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              text: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
              type: "text"
            }
          ],
          isError: true
        };
      }
    }
  });

}