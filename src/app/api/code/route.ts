import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

type ChatCompletionRequestMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function isAxiosError(
  error: unknown
): error is { response: { status: number } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.status === "number"
  );
}

// Crear una instancia de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionRequestMessage = {
  role: "system",
  content:
    "Your are a code generator. You must answer only in markdown code snippets. Use code comments for explanations",
};

export async function POST(Req: Request) {
  try {
    const { userId } = await auth();
    const body = await Req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [instructionMessage, ...messages],
    });

    return NextResponse.json(response.choices[0]?.message?.content);
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response.status === 429) {
      return new NextResponse(
        "API rate limit exceeded. Please try again later.",
        { status: 429 }
      );
    }
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
