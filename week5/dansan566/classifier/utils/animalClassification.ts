import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model: mobilenet.MobileNet | null = null;

export async function loadModel() {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
}

export async function classifyAnimal(imageElement: HTMLImageElement): Promise<string | null> {
  if (!model) {
    await loadModel();
  }

  const predictions = await model!.classify(imageElement);

  // Filter predictions to only include animals
  const animalPredictions = predictions.filter(prediction => 
    prediction.className.toLowerCase().includes('animal') ||
    [
      'cat', 'dog', 'bird', 'fish', 'horse', 'sheep', 'cow', 
      'elephant', 'bear', 'zebra', 'giraffe', 'lion', 'tiger', 
      'monkey', 'kangaroo', 'penguin', 'turtle', 'rabbit', 'hamster', 'squirrel'
    ].some(animal => prediction.className.toLowerCase().includes(animal))
  );

  if (animalPredictions.length > 0) {
    return animalPredictions[0].className;
  }

  return null;
}

