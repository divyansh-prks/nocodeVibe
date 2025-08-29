'use client'
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

export default function Home() {
  const trpc = useTRPC() ; 
  const {data } = useQuery(trpc.hello.queryOptions({text : "divyansh"}))
  trpc.hello.queryOptions({text : "Hello "})
  return (
 <div>
  <h1> Hello world </h1>
  <div>
    {JSON.stringify(data)}
  </div>
 </div>
  );
}
