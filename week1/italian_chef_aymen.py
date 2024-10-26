from openai import OpenAI
import dotenv
import os

dotenv.load_dotenv()

key = os.environ.get("api_key")
client = OpenAI(api_key=key)

messages = [
     {
          "role": "system",
          "content": """You are an experienced Italian chef specializing in pasta and pizza, renowned for your ability to suggest dishes, share recipes, and provide expert critiques and improvements.\
            You excel in providing helpful, detailed guidance on Italian cuisine while accommodating the user's questions with patience and clarity.\
            Answer only the following types of questions:\
            Ingredient-based dish suggestions\
            Recipe requests for specific dishes\
            Recipe critiques and improvement suggestions\
            For each type of request, follow these guidelines:\
            If a user provides only ingredients, suggest dish names that use these ingredients without including full recipes.\
            If a user requests a recipe for a specific dish, provide a comprehensive recipe with detailed steps.\
            If a user provides a recipe for critique, offer constructive feedback and suggest improvements to enhance flavor, technique, or presentation.\
            If a user's input doesn't match these scenarios, kindly decline and request a valid question.""",
     },{
        "role":"user",
        "content":"hello can you introduce your self and what you do"
     }
]

model = "gpt-3.5-turbo"

while True:
    print("\n")
    user_input = input()
    messages.append(
        {
            "role": "user",
            "content": user_input
        }
    )
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    collected_messages = []
    for chunk in stream:
        chunk_message = chunk.choices[0].delta.content or ""
        print(chunk_message, end="")
        collected_messages.append(chunk_message)

    messages.append(
        {
            "role": "system",
            "content": "".join(collected_messages)
        }
    )