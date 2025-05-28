// utils/ollamaApi.ts
interface OllamaGenerateParams {
  model: string;
  prompt: string;
  stream?: boolean;
  // system?: string; // Example: For system prompt
  // template?: string; // Example: For custom prompt template
  // options?: Record<string, any>; // Example: For temperature, top_p, etc.
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string; // This is the full generated text for non-streaming
  done: boolean;
  // Other fields like context, total_duration, eval_count, eval_duration etc. might be present
  error?: string; // Ollama might return an error in the JSON body
}

export async function generateTextWithOllama(promptText: string): Promise<string> {
  const ollamaApiEndpoint = process.env.OLLAMA_API_ENDPOINT;
  const ollamaModelName = process.env.OLLAMA_MODEL_NAME;

  if (!ollamaApiEndpoint) {
    const errorMsg = "Ollama API endpoint is not configured. Please set OLLAMA_API_ENDPOINT in your environment variables (e.g., in a .env file if your framework supports it, like VITE_OLLAMA_API_ENDPOINT for Vite).";
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error(errorMsg);
  }

  if (!ollamaModelName) {
    const errorMsg = "Ollama model name is not configured. Please set OLLAMA_MODEL_NAME in your environment variables (e.g., OLLAMA_MODEL_NAME or VITE_OLLAMA_MODEL_NAME for Vite).";
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error(errorMsg);
  }

  const payload: OllamaGenerateParams = {
    model: ollamaModelName,
    prompt: promptText,
    stream: false, // Using non-streaming response for simplicity
  };

  try {
    const fetchResponse = await fetch(ollamaApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!fetchResponse.ok) {
      // Attempt to parse error from Ollama's response body
      let errorDetail = `Error communicating with Ollama: HTTP ${fetchResponse.status} - ${fetchResponse.statusText}. Endpoint: ${ollamaApiEndpoint}`;
      try {
        const errorJson: OllamaGenerateResponse = await fetchResponse.json();
        if (errorJson.error) {
          errorDetail = `Ollama API Error: ${errorJson.error} (Status: ${fetchResponse.status})`;
          // Specifically check for model not found error
          if (errorJson.error.toLowerCase().includes("model") && (errorJson.error.toLowerCase().includes("not found") || errorJson.error.toLowerCase().includes("does not exist"))) {
            errorDetail = `Ollama model '${ollamaModelName}' not found. Please ensure the model is pulled/available in Ollama and the OLLAMA_MODEL_NAME is correct. (Details: ${errorJson.error})`;
          }
        }
      } catch (e) {
        // Could not parse JSON error, stick with HTTP status based error.
        // This might happen if Ollama is down and a proxy/gateway returns non-JSON error page.
        console.warn("Could not parse JSON error from Ollama error response:", e);
      }
      console.error(errorDetail);
      alert(errorDetail);
      throw new Error(errorDetail);
    }

    const data: OllamaGenerateResponse = await fetchResponse.json();

    // Some Ollama versions might return 200 OK but still include an error in the body
    if (data.error) {
        const errorMsg = `Ollama returned an error in response: ${data.error}`;
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
    }
    
    if (typeof data.response === 'string' && data.response.trim() !== '') {
      return data.response.trim();
    } else {
      const errorMsg = "Ollama API returned an empty or invalid response text. Check Ollama logs for more details.";
      console.warn(errorMsg, "Received data:", data);
      alert(errorMsg);
      throw new Error(errorMsg);
    }

  } catch (error: any) {
    // This catches:
    // 1. Network errors (fetch itself failed, e.g., Ollama server not running, DNS issue, CORS if not properly configured on Ollama server & it's a different origin)
    // 2. Errors explicitly thrown from the blocks above (e.g., !fetchResponse.ok, missing env vars)
    
    let errorMessageToAlertAndThrow: string;

    if (error instanceof Error) {
        // If the error message is one of our specific, already alerted messages, just rethrow.
        if (error.message.startsWith("Ollama API endpoint is not configured") ||
            error.message.startsWith("Ollama model name is not configured") ||
            error.message.startsWith("Ollama API Error:") ||
            error.message.startsWith("Ollama model ") || // Covers "Ollama model '...' not found"
            error.message.startsWith("Error communicating with Ollama:") ||
            error.message.startsWith("Ollama returned an error in response:") ||
            error.message.startsWith("Ollama API returned an empty or invalid response text.")) {
          throw error; // Rethrow the specific error, alert was already shown
        }
        // For other errors (likely network/fetch failures)
        errorMessageToAlertAndThrow = `Failed to connect to Ollama or process its response. Ensure Ollama is running and the endpoint '${ollamaApiEndpoint}' is correct. Details: ${error.message}`;
    } else {
        errorMessageToAlertAndThrow = `An unknown error occurred while trying to communicate with Ollama. Endpoint: ${ollamaApiEndpoint}`;
    }
    
    console.error("Overall error in generateTextWithOllama:", error); // Log the original error object
    alert(errorMessageToAlertAndThrow);
    throw new Error(errorMessageToAlertAndThrow); // Rethrow a new error or the modified one for App.tsx
  }
}