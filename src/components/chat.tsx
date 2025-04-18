"use client";

import { Card } from "@/components/ui/card";
import { type CoreMessage } from "ai";
import { useState } from "react";
import { continueTextConversation } from "@/app/actions";
import { readStreamableValue } from "ai/rsc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconArrowUp } from "@/components/ui/icons";
import Link from "next/link";
import AboutCard from "@/components/cards/aboutcard";
import { ProductCard } from "@/components/cards/productcard";
import { Result } from "@/types/zinc";

export const maxDuration = 30;

interface ExtendedMessage extends CoreMessage {
  products?: Result[];
}

export default function Chat() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMessages: ExtendedMessage[] = [
      ...messages,
      { content: input, role: "user" },
    ];
    setMessages(newMessages);
    setInput("");
    const result = await continueTextConversation(newMessages);
    setMessages(result.messages);
  };

  return (
    <div className="group w-full overflow-auto">
      {messages.length <= 0 ? (
        <AboutCard />
      ) : (
        <div className="max-w-xl mx-auto mt-10 mb-24">
          {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap flex flex-col mb-5">
              <div
                className={`${
                  message.role === "user"
                    ? "bg-slate-200 ml-auto"
                    : "bg-transparent"
                } p-2 rounded-lg`}
              >
                {message.content as string}
              </div>
              {message.products && (
                <div className="mt-2 flex flex-row gap-2">
                  {message.products.map((product) => (
                    <ProductCard key={product.productID} product={product} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="fixed inset-x-0 bottom-10 w-full ">
        <div className="w-full max-w-xl mx-auto">
          <Card className="p-2">
            <form onSubmit={handleSubmit}>
              <div className="flex">
                <Input
                  type="text"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                  className="w-[95%] mr-2 border-0 ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none"
                  placeholder="Ask me anything..."
                />
                <Button disabled={!input.trim()}>
                  <IconArrowUp />
                </Button>
              </div>
              {messages.length > 1 && (
                <div className="text-center">
                  <Link href="/genui" className="text-xs text-blue-400">
                    Try GenUI and streaming components &rarr;
                  </Link>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
