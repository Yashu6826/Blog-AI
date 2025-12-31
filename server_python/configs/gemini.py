# configs/gemini.py

import os
from google import genai  # Official import for the latest SDK
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is missing! Add it to your .env file.")

# Create the client (automatically uses the API key if set in env, but explicit is fine)
client = genai.Client(api_key=api_key)

# Use the latest fast & efficient model
model_name = "gemini-2.5-flash"

async def generate_content(prompt: str) -> str:
    try:
        # Use the async client: client.aio.models
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=prompt  # Can be str, list[Part], etc.
        )
        return response.text.strip() if response.text else "No response generated."
    except Exception as e:
        return f"Gemini error: {str(e)}"