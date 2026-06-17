from groq import Groq

from app.core.config import settings

client = Groq(
    api_key=settings.groq_api_key
)

def generate_answer(question: str, context: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": f"""
Answer using ONLY the provided context.

Context:
{context}
"""
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )

    return response.choices[0].message.content