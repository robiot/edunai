import { Volume2 } from "lucide-react";
import { FC, useState } from "react";

import { Button } from "@/components/ui/button";

export const TextToSpeech: FC<{ text: string }> = ({ text }) => {
  const [loading, setLoading] = useState(false);

  const handleTTS = async () => {
    if (!text) return;

    setLoading(true);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.play();
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTTS}
      disabled={loading}
      variant="outline"
      className=" h-12 min-w-12 w-12 p-0 text-sm rounded-full"
    >
      <Volume2 size={24} />
    </Button>
  );
};
