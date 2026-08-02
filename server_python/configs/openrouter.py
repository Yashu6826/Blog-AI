import asyncio
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv

load_dotenv()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.getenv("OPENROUTER_MODEL", "poolside/laguna-xs-2.1:free")


def _request_content(prompt: str) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is missing. Add it to the server environment.")

    payload = json.dumps({
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful blog-writing assistant. Follow the requested format exactly and return only the requested content.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": int(os.getenv("OPENROUTER_MAX_TOKENS", "1800")),
    }).encode("utf-8")
    request = Request(
        OPENROUTER_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("APP_URL", "http://localhost:5173"),
            "X-Title": "QuickBlog",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=45) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        try:
            message = json.loads(detail).get("error", {}).get("message", detail)
        except json.JSONDecodeError:
            message = detail
        raise RuntimeError(f"OpenRouter request failed ({error.code}): {message}") from error
    except URLError as error:
        raise RuntimeError(f"Could not reach OpenRouter: {error.reason}") from error

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not content:
        raise RuntimeError("OpenRouter returned an empty response.")
    return content


async def generate_content(prompt: str) -> str:
    return await asyncio.to_thread(_request_content, prompt)
