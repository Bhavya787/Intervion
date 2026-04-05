const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant. Follow the user's instructions exactly.";

const providerCallers = {
  openrouter: callOpenRouter,
  groq: callGroq,
  gemini: callGemini,
};

function parseProviderOrder() {
  const configuredOrder =
    process.env.AI_PROVIDER_ORDER || "openrouter,groq,gemini";

  return configuredOrder
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider) => provider in providerCallers);
}

function getProviderCandidates() {
  const selectedProvider = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const orderedProviders = parseProviderOrder();

  if (selectedProvider !== "auto" && selectedProvider in providerCallers) {
    return [selectedProvider, ...orderedProviders.filter((p) => p !== selectedProvider)];
  }

  return orderedProviders;
}

function hasProviderCredentials(provider) {
  switch (provider) {
    case "openrouter":
      return Boolean(process.env.OPENROUTER_API_KEY);
    case "groq":
      return Boolean(process.env.GROQ_API_KEY);
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    default:
      return false;
  }
}

async function postJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      data?.raw ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function callOpenRouter(prompt, options = {}) {
  const data = await postJson(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      ...(process.env.OPENROUTER_SITE_URL
        ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL }
        : {}),
      ...(process.env.OPENROUTER_APP_NAME
        ? { "X-Title": process.env.OPENROUTER_APP_NAME }
        : {}),
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages: [
        { role: "system", content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: options.temperature ?? 0.7,
    }),
  });

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callGroq(prompt, options = {}) {
  const data = await postJson(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: options.temperature ?? 0.7,
    }),
  });

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(prompt) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const data = await postJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

export async function generateAIResponse(prompt, options = {}) {
  const providers = getProviderCandidates().filter(hasProviderCredentials);
  const failures = [];

  for (const provider of providers) {
    try {
      const text = await providerCallers[provider](prompt, options);
      if (!text) {
        throw new Error("Provider returned an empty response");
      }
      return text;
    } catch (error) {
      failures.push(`${provider}: ${error.message}`);
    }
  }

  if (failures.length === 0) {
    throw new Error(
      "No AI provider is configured. Add OPENROUTER_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY."
    );
  }

  throw new Error(failures.join(" | "));
}
