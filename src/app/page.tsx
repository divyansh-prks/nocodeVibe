import { caller, getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";


const page = async ()=> {
const queryClient = getQueryClient() ; 
void queryClient.prefetchQuery(trpc.createAI.queryOptions({text : "divyansh prefetch"}))

  const data = await caller.createAI({text : "divyansh server"})
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense  fallback= {<p> Loading ... </p>}>

<Client/>
      </Suspense>
 <div>
{JSON.stringify(data)}
 </div>
    </HydrationBoundary>
  );
}
// ...
export default page ;