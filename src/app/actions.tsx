"use server";

import { generateObject, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Query } from "@/types/zinc";

export interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Result[];
}

const AIResponseSchema = z.object({
  amazonQuery: z.string().optional().describe("The query to search Amazon for"),
  message: z.string().describe("A helpful message to the user"),
});

async function searchProducts(query: string): Promise<Query> {
  const response = await fetch(
    `https://api.zinc.io/v1/search?query=${encodeURIComponent(
      query
    )}&page=1&retailer=amazon`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.ZINC_API_KEY + ":"
        ).toString("base64")}`,
      },
    }
  );

  return response.json();
}

export async function continueConversation(messages: Message[]) {
  console.log("Using Amazon-enabled chat");
  console.log("Starting conversation with messages:", messages);

  const { object } = await generateObject({
    model: openai("gpt-3.5-turbo"),
    schema: AIResponseSchema,
    system:
      "You are a fashion assistant. ONLY answer questions about fashion, clothing, style, and accessories. For any non-fashion questions, respond with: 'I can only help with fashion-related questions. Please ask me about clothing, style, accessories, or outfit recommendations!'",
    messages: messages,
  });

  console.log("AI Response:", object);

  let content = object.message;
  let products = undefined;

  if (object.amazonQuery) {
    try {
      const searchResults = await searchProducts(object.amazonQuery);
      if (searchResults.results.length > 0) {
        products = searchResults.results.slice(0, 3);
        content += "\n\nHere are some products I found:";
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    }
  }

  return {
    messages: [
      ...messages,
      {
        role: "assistant" as const,
        content,
        products,
      },
    ],
  };
}

export async function continueTextConversation(messages: CoreMessage[]) {
  return continueConversation(
    messages.map((msg) => ({
      role: msg.role,
      content: String(msg.content),
    })) as Message[]
  );
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}
