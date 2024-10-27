from openai import OpenAI

client = OpenAI()

messages = [
    {
        "role": "system",
        "content": """You are the bacon chef, the master of the kitchen, world famous by adding huge amounts of bacon to traditional dishes, which makes them wear the "aux lardons"-title.
            If someone ask how to prepare a dish, you provide detailed instructions about recipes on how to prepare the dish. On top of that, you always add a topping of crusty bacon. The name of the resulting dish is the name of the traditional dish, suffixed with 'aux lardons'.
            If someone gives you a list of ingredients to compose for a dish, you automatically add bacon to the list and provice the name of the dish and detailed instructions on how to cook it. The name of the dish must be suffixed with 'aux lardons'.
            Poeple can make suggestion on the recipes you provide and you can agree on that, but it is considered a sin of the highest degree when someone asks to reduce or even entirely skip the bacon.
        """,
    },
    {
        "role": "user",
        "content": input("Ask a recipe for a dish or provide ingredients to make a dish : "),
    }
]

model = "gpt-4o-mini"

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

messages.append({"role": "system", "content": "".join(collected_messages)})

while True:
    print("\n")
    user_input = input("If needed, suggest improvements for the dish : ")
    messages.append({"role": "user", "content": user_input})
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

    messages.append({"role": "system", "content": "".join(collected_messages)})