import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "30s");

    // another wait 30 second for transcribing 

    // another wait 10 sec for summarizing 
    return { message: `Hello ${event.data.email}!` };
  },
);