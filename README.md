# computervisionAI

Weekend Project for Encode Club AI Bootcamp.
* We will create a new application from scratch using NextJS and a page with a single input field for the user to upload an image (I.E. a picture from an animal).
* We will add a button to upload the image.
* We will use a Computer Vision model to detect and classify the animal

    The model should be able to detect at least 10 different animals of your choice
    The model should return the name of the animal detected (classification)

We configured the system to be able to classify 10 animals:
  
"cat", "dog", "lion", "tiger", "snake", "zebra", "giraffe", "bear", "hippopotamus", "scorpion"

Additionally, if possible:  

* We will create an AI Agent that can find a page in Wikipedia with the name of the animal, we will retrieve the description, and we will determine if the animal is dangerous
* If the uploaded image contains an animal, we will pass the image to the AI Agent and await the answer
* We wil display the answer on the page, indicating whether the animal in the picture is dangerous

# Testing animal classification:

* an image with a non listed animal:                                                            

  ![imatge](https://github.com/user-attachments/assets/7a641809-607b-41b7-ad26-096110c34a3a)   


* an image with an animal in our list:

  ![imatge](https://github.com/user-attachments/assets/b21738b4-4389-4208-b08d-5d76e9b4473f)

* an image without any animal:                                                                   

  ![imatge](https://github.com/user-attachments/assets/dfd3b624-d843-4db0-86af-6bc20d85c443)

* **a very interesting hack:** I wonder if Tiger Woods can be classified as dangerous or not...
  
  ![imatge](https://github.com/user-attachments/assets/ab45261a-3010-4330-b8c5-caffbb983fa3)

# Added Wikipedia retrieval info and agent Danger Evaluation

* an image with a non listed animal:

  ![imatge](https://github.com/user-attachments/assets/91bfbc85-8d47-4f83-a2ad-992e6e4838cc)

* an image with an animal in our list:

  ![imatge](https://github.com/user-attachments/assets/1e9dd780-6793-4203-a6a5-94e292dae737)

* an image without any animal:

  ![imatge](https://github.com/user-attachments/assets/ab62fcff-7511-4328-8fcb-cb6e71c84ab7)

* **a very interesting hack:** Looks like Tiger Woods is not dangerous...

  ![imatge](https://github.com/user-attachments/assets/4f17d462-30e8-4107-bd8b-87b43179781d)
  
* **another not dangerous example:

  ![imatge](https://github.com/user-attachments/assets/76e838e2-0433-468e-8b18-734bffb55848)

  
  
