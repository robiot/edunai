import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = "sk_397f04d0938b77a1ed65d8d5dfee412d0c8bb491969d4fb2"; // cba to make this a env var
    const voiceId = "4VZIsMPtgggwNg7OXbPY"; // Replace with a valid voice ID

    //fQj4gJSexpu8RDE2Ii5m
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey!,
        },
        body: JSON.stringify({
          text,
          //   voice_settings: { language: "zh" },
          model_id: "eleven_flash_v2_5", // Use the correct model ID for Sleven Flash v2.5
          voice_settings: {
            stability: 0.5, // Adjust as needed
            similarity_boost: 0.75, // Adjust as needed
          },
        }),
      },
    );

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch {
    return NextResponse.json(
      { error: "Error generating speech" },
      { status: 500 },
    );
  }
}
