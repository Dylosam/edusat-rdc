type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GenerateTextParams = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

type GenerateTextResult = {
  text: string;
  raw?: unknown;
};

function getEnv(name: string) {
  return process.env[name]?.trim();
}

export async function generateAiText({
  messages,
  temperature = 0.4,
  maxTokens = 900,
}: GenerateTextParams): Promise<GenerateTextResult> {
  const apiKey = getEnv("AI_API_KEY");
  const baseUrl = getEnv("AI_BASE_URL") || "https://openrouter.ai/api/v1";
  const model = getEnv("AI_MODEL") || "openai/gpt-4o-mini";

  if (!apiKey) {
    throw new Error("AI_API_KEY manquante. Ajoute-la dans ton fichier .env.local.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(getEnv("AI_HTTP_REFERER")
        ? { "HTTP-Referer": getEnv("AI_HTTP_REFERER") as string }
        : {}),
      ...(getEnv("AI_X_TITLE") ? { "X-Title": getEnv("AI_X_TITLE") as string } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const rawText = await response.text();

  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error("[AI_PROVIDER_NON_JSON_RESPONSE]", rawText);
    throw new Error("Le provider IA a renvoyé une réponse invalide (non JSON).");
  }

  if (!response.ok) {
    const message =
      data?.error?.message || data?.message || `Erreur IA (${response.status})`;
    throw new Error(message);
  }

  const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";

  if (!text || typeof text !== "string") {
    throw new Error("Le modèle n’a pas renvoyé de texte exploitable.");
  }

  return {
    text: text.trim(),
    raw: data,
  };
}