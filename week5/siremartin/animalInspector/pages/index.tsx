import Head from "next/head";
import { ChangeEvent, Component, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const animalList = ["bee", "cat", "dog", "spider", "dolphin", "shark", "penguin", "gorilla", "jellyfish", "camel", "elephant"];

  const [answer, setAnswer] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [animalScore, setAnimalScore] = useState<number | null>(null);
  const [animalName, setAnimalName] = useState<string | null>(null);
  const [wikiResponse, setWikiResponse] = useState<string | null>(null);
  const [dangerResponse, setDangerResponse] = useState<string | null>(null);


  //helper methods for file to base64
  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const base64String = await toBase64(file);
    setBase64(base64String as string);

    //reset screen
    setAnimalName(null);
    setAnimalScore(null);
    setWikiResponse(null);
    setDangerResponse(null);
  };
  /*
  Just being lazy here and calling clip-as-service from front instead of
  doing back-end call and consuming clip-as-service there
  this requires cors to be enabled in clip-as-service!
  */
  async function handleSubmit(event) {
    event.preventDefault();
    const result = await fetch("http://localhost:8081/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            blob: base64?.substring(base64?.indexOf("base64") + 6),
            matches: animalList.map((animalName) => ({
              text: `this is a photo of a ${animalName}`
            }))
          }
        ],
        execEndpoint: "/rank"
      }),
    });
    const { data, error, payload } = await result.json();
    //console.log(data);
    console.log(`highest score = ${data[0].matches[0].scores.clip_score.value} for ${data[0].matches[0].text}`);
    setAnimalScore(data[0].matches[0].scores.clip_score.value);
    setAnimalName(data[0].matches[0].text.trim().split(/\s+/).pop());

    if (error) {
      console.log(error);
    }

    if (payload) {
      console.log(payload.response);
    }
  }

  return (
    <>
      <Head>
        <title>Animal Danger Detector</title>
      </Head>
      <main className="mx-2 flex h-full flex-col lg:mx-56">
        <div className="space-y-2">
          <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-red-900 md:text-5xl lg:text-6xl dark:text-white">
            Animal Danger Analysis
          </h1>

          Provide a picture of one of the following animals:
          <ol className="list-decimal">
            {
              animalList.map((animalName) => (
                <li>{animalName}</li>
              ))
            }
          </ol>

          <form onSubmit={handleSubmit}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {base64 && (
              <>
                <img
                  src={base64}
                  alt="Uploaded file preview"
                  width={300}
                  height={300}
                />
                <Button type="submit" onClick={handleSubmit}>Analyze photo using CLIP</Button>
              </>
            )}
          </form>

          {(animalScore && (animalScore ?? 0) < .4) && (
            <div>
              Could not classify animal to one of the provided types, because score lower than 0.4<br />
              Score = {animalScore} for {animalName}<br />
              Try to analyse another picture
            </div>
          )}

          {((animalScore ?? 0) >= .4) && animalName && (
            <>
              This is calssified as a {animalName} with a score of {animalScore}
              <br />
              <Button
                type="submit"
                onClick={async () => {
                  // Post the query and nodesWithEmbedding to the server
                  const result = await fetch("/api/searchwiki", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      animalName
                    }),
                  });

                  const { error, payload } = await result.json();
                  console.log(payload);

                  setWikiResponse(payload.response);

                  if (error) {
                    setAnswer(error);
                  }

                  if (payload) {
                    setAnswer(payload.response);
                  }
                }}
              >
                Wiki Search
              </Button>
            </>
          )}

          {wikiResponse && (
            <>
              {wikiResponse}
              <br />
              <Button
                type="submit"
                onClick={async () => {
                  // Post the query and nodesWithEmbedding to the server
                  const result = await fetch("/api/determinedangerous", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      inputDocument: wikiResponse
                    }),
                  });

                  const { error, payload } = await result.json();
                  console.log(payload);

                  setDangerResponse(payload.response);

                  if (error) {
                    setAnswer(error);
                  }

                  if (payload) {
                    setAnswer(payload.response);
                  }
                }}
              >
                Is {animalName} dangerous?
              </Button>
            </>
          )}
          {dangerResponse && (
            <div>{dangerResponse}</div>
          )}
        </div>
      </main>
    </>
  );
}
