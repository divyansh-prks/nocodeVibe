import { inngest } from "./client";
// import {    openai, createAgent } from "@inngest/agent-kit";
import { openai, gemini, createAgent } from "@inngest/agent-kit";
import { createNetwork } from "@inngest/agent-kit";

import { Sandbox } from 'e2b'
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },





    async ({ event, step }) => {
        const sandboxId = step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("vibe-next-js-test-3");
            return sandbox.sandboxId;
        })

         

            const model = gemini({
                model: "gemini-1.5-flash",
            })

            //fair 

            const codeAgent = createAgent({
                model: model,
                name: "code-agent",
                system: "You are an expert next js developer.  You write readable and maintainable code . Your write simple nextsjs and react js snippets  .",

            });
            //       // Run the agent with an input.  This automatically uses steps
            //     // to call your AI model.
            const { output } = await codeAgent.run(
                `Summarize : ${event.data.value} `

            );

            const sandboxUrl = await step.run("get-sandbox-url", async () => {
                const sandbox = await getSandbox(sandboxId)
                const host = sandbox.getHost(3000);
                return `https://${host}`;


            })



            console.log(output, sandboxUrl)
            return { output };
        },

     
);
