Encode AI Bootcamp 24 Group 8 Repo

I initialized a repo with a docker-compose with the original chef file.
Currently i am facing issues with my tty not working through docker-compose. When launching the built image with docker and option -it i can make user input.

To start, go to the root dir of the repo and type:
export OPENAI_API_KEY='your token'
docker-compose -f week1.py up

Hope you don't face the same issue.

The docker-compose should be a nice to have for tutor evaluation :)
For developing, update and run the python file directly in ./week1 
