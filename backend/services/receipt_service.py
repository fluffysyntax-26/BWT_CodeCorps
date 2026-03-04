import google.generativeai as genai
import os
from dotenv import load_dotenv
import io
from PIL import Image
import pytesseract
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


async def parse_receipt_image(image_bytes):

    prompt = """
You are an AI financial assistant.

Look at this receipt image and extract:

merchant
title
amount
category

Categories allowed:
Food & Groceries
Transport
Utilities & Bills
Shopping
Other

Return ONLY JSON like:

{
 "merchant": "",
 "title": "",
 "amount": 0,
 "category": ""
}
"""

    response = await model.generate_content_async([
        prompt,
        {"mime_type": "image/jpeg", "data": image_bytes}
    ])

    text = response.text.strip()

    text = text.replace("```json", "").replace("```", "")

    import json
    return json.loads(text)


def extract_text_from_image(file_bytes: bytes):
    image = Image.open(io.BytesIO(file_bytes))

    # convert to grayscale
    image = image.convert("L")

    text = pytesseract.image_to_string(image)

    return text


async def parse_receipt_with_ai(text: str):
    """
    Use Gemini to extract structured receipt data.
    Always returns valid JSON.
    """

    try:
        prompt = f"""
You are a financial assistant that extracts structured data from receipts.

Extract:

merchant
title
amount
category

Allowed categories:
Food & Groceries
Transport
Utilities & Bills
Other

Return ONLY JSON like this:

{{
 "merchant": "string",
 "title": "string",
 "amount": number,
 "category": "string"
}}

Receipt text:
{text}
"""

        response = await model.generate_content_async(prompt)

        ai_text = response.text.strip()

        # remove markdown formatting if Gemini adds it
        ai_text = ai_text.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(ai_text)

        # Validate fields
        parsed.setdefault("merchant", "Unknown")
        parsed.setdefault("title", "Receipt Expense")
        parsed.setdefault("amount", 0)
        parsed.setdefault("category", "Other")

        return parsed

    except Exception as e:
        print("AI PARSE ERROR:", str(e))

        # fallback so API never crashes
        return {
            "merchant": "Unknown",
            "title": "Receipt Expense",
            "amount": 0,
            "category": "Other"
        }