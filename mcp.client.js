import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { generateContent, ai } from "./gemini.js";

generateContent("hello ai");
const tools = [];

const transport = new StdioClientTransport({
  command: "node",
  args: ["./mcp.server.js"],
});

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

await client.connect(transport);

client.listTools().then(async (response) => {
  response.tools.forEach((tool) => {
    tools.push({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "OBJECT",
        properties: tool.inputSchema.properties || [],
        required: tool.inputSchema.required || [],
      },
    });
  });

  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "sum 2 and 10",
    config: {
      tools: [
        {
          functionDeclarations: tools,
        },
      ],
    },
  });

  console.log("tools -> ", tools);
  console.log("ai response -> ", aiResponse.functionCalls);
});
