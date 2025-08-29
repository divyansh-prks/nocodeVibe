"use client "

import { useTRPC } from "@/trpc/client"
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
    const trpc = useTRPC(); 
    const {data } = useSuspenseQuery(trpc.createAI.queryOptions({text : "divyansh prefetch"}))

    return (
        <div>
            {JSON.stringify(data)}
        </div>
    )
}