import json
from openai import OpenAI

client = OpenAI()


def analyze_ticket(title: str, description: str):
    response = client.responses.create(
        model="gpt-5.6",
        instructions="""
You are an AI assistant for an IT help desk.

Analyze the submitted support ticket.

Choose exactly one category:
- Hardware
- Software
- Network
- Account
- Other

Choose exactly one priority:
- Low
- Medium
- High

Also provide a short troubleshooting suggestion for the user.

Return ONLY valid JSON using this format:
{
    "category": "Hardware",
    "priority": "Medium",
    "suggestion": "Short troubleshooting suggestion"
}
""",
        input=f"""
Ticket title: {title}
Ticket description: {description}
"""
    )

    return json.loads(response.output_text)