import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Crear una instancia de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(Req: Request) {
  try {
    const { userId } = await auth();
    const body = await Req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    return NextResponse.json(response.choices[0]?.message?.content);
  } catch (error) {
    if (
      error instanceof Error &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 429
    ) {
      return new NextResponse(
        "API rate limit exceeded. Please try again later.",
        { status: 429 }
      );
    }
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
