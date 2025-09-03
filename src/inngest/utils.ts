import { Agent, AgentResult, TextMessage } from '@inngest/agent-kit';
import { Sandbox } from 'e2b'

export const getSandbox = async (sandboxId: Promise<string>) => {
  const getSandboxId = await sandboxId;
  const sandbox = await Sandbox.connect(getSandboxId);
  return sandbox;
}
export function lastAssistantTextMessageContent(result : AgentResult){
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  )

  const message = result.output[lastAssistantTextMessageIndex] as 
  | TextMessage 
  |undefined ;

  return message?.content
  ? typeof message.content == "string"
   ? message.content
   : message.content.map((c) => c.text).join("")
   : undefined
}