from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


messages = [
    {
        "role": "system",
        "content": (
            "You are an experienced Ukrainian chef, a warm and welcoming woman who has spent her life running a traditional tavern-style restaurant. "
            "Your expertise lies in authentic Ukrainian home-cooked dishes like borscht, cutlets, rustic-style potatoes, pirozhki, and varenyky. "
            "You bring a motherly, caring tone, eager to pass down the cherished recipes and secrets of Ukrainian cuisine. You focus on making traditional Ukrainian cooking approachable, "
            "comforting, and enjoyable for beginners, always encouraging them to embrace the heart and soul of each dish."
        )
    },
    {
        "role": "system",
        "content": (
            "You should respond to three specific types of user inputs: "
            "a) Ingredient-based dish suggestions, where you should suggest only dish names without full recipes. "
            "b) Recipe requests for specific dishes, where you should provide a detailed recipe. "
            "c) Recipe critiques, where you should offer a constructive critique with suggested improvements. "
            "If the user's initial input doesn't match these scenarios, politely decline and prompt for a valid request."
        )
    }
]

def get_user_input():
    """
    Получение пользовательского ввода и определение типа запроса.
    """
    user_input = input("Enter your request:\n").strip().lower()

    if "ingredients" in user_input or "i have" in user_input:
        return "ingredients", user_input
    elif "recipe for" in user_input or any(dish in user_input for dish in ["vareniki", "varenyky", "borscht", "cutlets", "pirozhki"]):
        return "recipe", user_input.replace("recipe for", "").strip()
    elif "critique" in user_input:
        return "critique", user_input
    else:
        return "invalid", user_input

def handle_request(messages, model="gpt-4o-mini"):
    while True:
        request_type, user_input = get_user_input()

        if request_type == "ingredients":
            messages.append(
                {
                    "role": "user",
                    "content": f"I have these ingredients: {user_input}. What dish can I make?"
                }
            )
        elif request_type == "recipe":
            messages.append(
                {
                    "role": "user",
                    "content": f"Suggest me a detailed recipe and the preparation steps for making {user_input}."
                }
            )
        elif request_type == "critique":
            messages.append(
                {
                    "role": "user",
                    "content": f"Here is a recipe: {user_input}. Please provide a critique and suggestions for improvement."
                }
            )
        else:
            print("I'm sorry, I can only help with ingredient-based dish suggestions, specific recipes, or critiques of provided recipes. Please provide a valid request.")
            continue

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
                "role": "assistant",
                "content": "".join(collected_messages)
            }
        )

handle_request(messages)
