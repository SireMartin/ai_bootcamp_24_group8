FROM python:3.10-alpine AS base
RUN pip install openai
WORKDIR /app
COPY ["week1.py", "."]
ENTRYPOINT ["python3", "baconChef.py"]