Info to run weekend 5 project:

Start 2 consoles and export openai api key in both
export OPENAI_API_KEY-="sk-..."

in first console host the clip service
run the clip-as-service
the config.yml makes it is exposed on localhost:8081 and cors is enabled, so we can call if from fe
```
cd clipService
python3 -m venv venv
source ./venv/bin/activate
pip install clip-server
python -m clip_server config.yml
```

in second console run the nextjs app
```
cd animalInspector
npm install
npm run dev
```
goto http://localhost:3000 and evaluate the application

![image](https://github.com/user-attachments/assets/4da608b5-2b20-42c4-b43a-17605a99dd58)
