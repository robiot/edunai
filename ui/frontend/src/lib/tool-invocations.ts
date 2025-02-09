// Types for tool invocations
export interface ToolInvocation {
  state: "result";
  toolName: string;
  toolCallId: string;
  args: Record<string, any>;
  result: any;
}

export interface ToolResult<TName extends string, TArguments, TResult> {
  toolCallId: string;
  toolName: TName;
  args: TArguments;
  result: TResult;
}

// Type for JSON action results
export interface JsonActionResult {
  action: string;
  [key: string]: any;
}

/**
 * Extracts tool invocations from a message content string
 * @param content - The message content to parse
 * @returns Array of parsed tool invocations
 */
export function extractToolInvocations(content: string): ToolInvocation[] {
  const toolInvocations: ToolInvocation[] = [];

  // Match pattern: <tool>json_action</tool> {...} </tool>
  const toolMatches = content.match(
    /<tool>json_action<\/tool>\s*({[\S\s]*?})\s*<\/tool>/g,
  );

  if (!toolMatches) return [];

  //@ts-ignore
  for (const [index, match] of toolMatches.entries()) {
    // Extract the JSON part
    const jsonMatch = match.match(
      /<tool>json_action<\/tool>\s*({[\S\s]*?})\s*<\/tool>/,
    );

    if (jsonMatch && jsonMatch[1]) {
      try {
        // Parse the JSON content
        const result = JSON.parse(jsonMatch[1]);

        // Create a tool invocation object
        const toolInvocation: ToolInvocation = {
          state: "result",
          toolName: "json_action",
          // Generate a unique ID for each tool call
          toolCallId: `json_action_${Date.now()}_${index}`,
          args: {}, // The original arguments (empty for now since we don't have them)
          result: result,
        };

        toolInvocations.push(toolInvocation);
      } catch (error) {
        console.error("Failed to parse JSON from tool invocation:", error);
      }
    }
  }

  return toolInvocations;
}
