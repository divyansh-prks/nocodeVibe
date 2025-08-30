import { inngest } from "./client";
// import {    openai, createAgent } from "@inngest/agent-kit";
import {openai , gemini, createAgent } from "@inngest/agent-kit";
import { createNetwork } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event}) => {
    // await step.sleep("wait-a-moment", "10s");

    const model = gemini({
  model: "gemini-1.5-flash",
});


//rough 
// const supportAgent = createAgent({
//   model: model,
//   name: "Customer support specialist",
//   system: "You are an customer support specialist... You can give some advise ",
// });



//fair 

    const codeAgent= createAgent({
  model: model,
  name: "code-agent",
  system: "You are an expert next js developer.  You write readable and maintainable code . Your write simple nextsjs and react js snippets  .",
  
});
//       // Run the agent with an input.  This automatically uses steps
//     // to call your AI model.
    const { output } = await codeAgent.run(
        `Summarize : ${event.data.value} `

        );
        //just testing 

        console.log(output)
    return {output};
  },
);