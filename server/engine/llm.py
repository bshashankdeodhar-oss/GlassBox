"""
GlassBox LLM Client — Gemini API integration with full token tracking.
Wraps google-genai SDK to provide traced, metered LLM calls.
"""

import os
from typing import Optional, Dict, Any
from google import genai
from dotenv import load_dotenv

# Load API key from .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

_API_KEY = os.getenv("GEMINI_API_KEY", "")
_DEFAULT_MODEL = "gemini-3.6-flash"


class LLMClient:
    """Thin wrapper around Gemini API with token usage tracking."""

    def __init__(self, api_key: str = "", model: str = _DEFAULT_MODEL):
        self.api_key = api_key or _API_KEY
        self.model = model
        self.client = genai.Client(api_key=self.api_key)

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
        max_output_tokens: int = 1024,
    ) -> Dict[str, Any]:
        """
        Calls Gemini and returns response text + usage metadata.
        Returns:
            {
                "text": str,
                "prompt_tokens": int,
                "completion_tokens": int,
                "total_tokens": int,
                "model": str,
            }
        """
        try:
            config = genai.types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            )
            if system_instruction:
                config.system_instruction = system_instruction

            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )

            # Extract token usage from response metadata
            usage = response.usage_metadata
            prompt_tokens = usage.prompt_token_count if usage else 0
            completion_tokens = usage.candidates_token_count if usage else 0

            return {
                "text": response.text or "",
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": (prompt_tokens + completion_tokens),
                "model": self.model,
            }

        except Exception as e:
            # On API failure, return error but don't crash the pipeline
            return {
                "text": f"[LLM ERROR: {str(e)}]",
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "model": self.model,
                "error": str(e),
            }


# Global LLM client singleton
global_llm = LLMClient()
