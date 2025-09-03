// import { inngest } from "./client";
// import {z} from "zod";
// // import {    openai, createAgent } from "@inngest/agent-kit";
// import {  openai, gemini, createAgent, createTool } from "@inngest/agent-kit";
// import { createNetwork } from "@inngest/agent-kit";
// import { PROMPT } from "../../prompt";

// import { Sandbox } from 'e2b'
// import { getSandbox } from "./utils";


import {
	gemini,
	openai,
	createAgent,
	createTool,
	createNetwork,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "../../prompt";
import { object, z } from "zod";



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

//             const codeAgent = createAgent({
//                 model: model,
//                 name: "code-agent",
//                 system: "You are an expert next js developer.  You write readable and maintainable code . Your write simple nextsjs and react js snippets  .",
//                 tools : [
//                     createTool ({
//                         name: "terminal" , 
//                         description : "Use the terminal to run commands " , 
//                         parameters: z.object({
//                             command: z.string(),
//                         }), 
//                         handler : async ({command}, {step}) => {
//                             const buffers = {stdout : "" , stderr: ""};

//                             try {
//                                 const sandbox = await getSandbox(sandboxId); 
//                                 const result = await sandbox.commands.run(command);
//                             }catch {
                                
//                             }
//                         }
//                     })
//                 ]

//             });
//             //       // Run the agent with an input.  This automatically uses steps
//             //     // to call your AI model.
//             const { output } = await codeAgent.run(
//                 `Summarize : ${event.data.value} `

//             );

//             const sandboxUrl = await step.run("get-sandbox-url", async () => {
//                 const sandbox = await getSandbox(sandboxId)
//                 const host = sandbox.getHost(3000);
//                 return `https://${host}`;


//             })



//             console.log(output, sandboxUrl)
//             return { output };
//         },

     
// );



		// 4) Build your agent & network
		const codeAgent = createAgent({
			name: "An expert coding agent",
			system: PROMPT,
			model,
			tools: [
				// terminal use
				createTool({
					name: "terminal",
					description: "Use the terminal to run commands",
					parameters: z.object({
                    command: z.string(),
          }),
					handler: async ({ command } , {step}) => {
						return await step?.run("terminal" , async () => {

							const buffers = { stdout: "", stderr: "" };
							try {
								const sandbox = await getSandbox(sandboxId);
								const result = await sandbox.commands.run(command, {
									onStdout: (data: string) => {
										buffers.stdout += data;
									},
									onStderr: (data: string) => {
										buffers.stderr += data;
									},
								});
								return result.stdout;
							} catch (e) {
								console.error(
									`Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
								);
								return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
							}
						})

					},
				}),
				// create or update file
				createTool({
					name: "createOrUpdateFiles",
					description: "Create or update files in the sandbox",
					parameters: z.object({
						files: z.array(
							z.object({
								path: z.string(),
								content: z.string(),
							})
						),
					}),
					handler: async ({ files } , {step , network}) => {
						const newFiles = await step?.run("createOrUpdateFiles" , async () => {

							try {
								const updatedFiles = network.state.data.files || {} ; 
								const sandbox = await getSandbox(sandboxId);
								for (const file of files) {
									await sandbox.files.write(file.path, file.content);
									updatedFiles[file.path] = file.content;

								}

									return updatedFiles; 
							} catch (e) {
								return "Error: " + e;
							}
						})
						if (typeof newFiles === "object"){
							network.state.data.files = newFiles; 
						}
					},
				}),
				// read files
				createTool({
					name: "readFiles",
					description: "Read files from the sandbox",
					parameters: z.object({
						files: z.array(z.string()),
					}),
					handler: async ({ files } , {step}) => {
						return await step?.run("readFiles" , async () => {
							try {
								
								const sandbox = await getSandbox(sandboxId);
								const result: Array<{ path: string; content: string }> = [];
								for (const f of files) {
									const content = await sandbox.files.read(f);
									result.push({ path: f, content });
								}
								return JSON.stringify(result);
							} catch (e) {
								return "Error" + e;

								
							}

						})
					},
				}),
			],
			lifecycle: {
				onResponse: async ({ result, network }) => {
					const txt = await lastAssistantTextMessageContent(result);
					if (txt?.includes("<task_summary>") && network) {
						network.state.data.summary = txt;
					}
					return result;
				},
			},
		});

		const network = createNetwork({
			name: "coding-agent-network",
			agents: [codeAgent],
			defaultModel: model,
			maxIter: 15,
			router: async ({ network }) => {
				// network.state.data.summary ? undefined : codeAgent,
				const summary = network.state.data.summary
				if (summary){
					return
				}
				return codeAgent;

			}
		});

		// 5) Run!
		const result = await network.run(event.data.value);
		const sandboxUrl = await step.run("get-sandbox-url" , async() => {
			const sandbox = await getSandbox(sandboxId); 
			const host = sandbox.getHost(3000);
			return `https://${host}`
		})
		return {
		url:	sandboxUrl,
		title : "fragment" , 
		files : result.state.data.files,
		summary : result.state.data.summary
		}
		// const sandbox = await getSandbox(sandboxId);
		// return {
		// 	url: `https://${sandbox.getHost(3000)}`,
		// 	title: "Fragment",
		// 	files: result.state.data.files || {},
		// 	summary: result.state.data.summary || "",
		// };
	}
);