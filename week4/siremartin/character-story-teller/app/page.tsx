"use client";

import { useChat } from 'ai/react';
import { useState, useId, ChangeEvent } from 'react';

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { LinkedSlider } from './components/ui/linkedslider';

interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
}

type CharactersArray = {
  characters: Character[]
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showButtonGenerateCharacters, setShowButtonGenerateCharacters] = useState(false);
  const [showStoryCharacters, setShowStoryCharacters] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: ''
  });
  const { messages, append, isLoading, reload } = useChat({ api: "/api/completion" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCharacter) {
      setCharacters(characters.map(char =>
        char.id === editingCharacter.id ? { ...formData, id: char.id } : char
      ));
      setEditingCharacter(null);
    } else {
      setCharacters([...characters, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
    setFormData({ name: '', description: '', personality: '' });
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData(character);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const DEFAULT_CHUNK_SIZE = 1024;
  const DEFAULT_CHUNK_OVERLAP = 20;
  const DEFAULT_TOP_K = 2;
  const DEFAULT_TEMPERATURE = 0.1;
  const DEFAULT_TOP_P = 1;

  const answerId = useId();
  const queryId = useId();
  const sourceId = useId();
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [needsNewIndex, setNeedsNewIndex] = useState(true);
  const [buildingIndex, setBuildingIndex] = useState(false);
  const [runningQuery, setRunningQuery] = useState(false);
  const [nodesWithEmbedding, setNodesWithEmbedding] = useState([]);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE.toString());
  //^ We're making all of these strings to preserve things like the user typing "0."
  const [chunkOverlap, setChunkOverlap] = useState(
    DEFAULT_CHUNK_OVERLAP.toString(),
  );
  const [topK, setTopK] = useState(DEFAULT_TOP_K.toString());
  const [temperature, setTemperature] = useState(
    DEFAULT_TEMPERATURE.toString(),
  );
  const [topP, setTopP] = useState(DEFAULT_TOP_P.toString());
  const [answer, setAnswer] = useState("");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="my-2 flex h-3/4 flex-auto flex-col space-y-2">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">1. Upload source text file</h1>
        <Input
          id={sourceId}
          type="file"
          accept=".txt"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const fileContent = event.target?.result as string;
                setText(fileContent);
                setNeedsNewIndex(true);
              };
              if (file.type != "text/plain") {
                console.error(`${file.type} parsing not implemented`);
                setText("Error");
              } else {
                reader.readAsText(file);
              }
            }
          }}
        />
        {
          text && (
            <Textarea
              value={text}
              readOnly
              placeholder="File contents will appear here"
              className="flex-1"
            />
          )
        }
      </div>
      <div className='flex justify-center'>
        <Button
          disabled={!needsNewIndex || buildingIndex || runningQuery}
          onClick={async () => {
            setAnswer("Building index...");
            setBuildingIndex(true);
            setNeedsNewIndex(false);
            // Post the text and settings to the server
            const result = await fetch("/api/splitandembed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                document: text,
                chunkSize: parseInt(chunkSize),
                chunkOverlap: parseInt(chunkOverlap),
              }),
            });
            const { error, payload } = await result.json();

            if (error) {
              setAnswer(error);
            }

            if (payload) {
              setNodesWithEmbedding(payload.nodesWithEmbedding);
              setAnswer("Index built!");
              setShowButtonGenerateCharacters(true);
            }

            setBuildingIndex(false);
          }}
        >
          {buildingIndex ? "Building Vector index..." : "Build index"}
        </Button>
      </div>

      {!buildingIndex && !needsNewIndex && !runningQuery && showButtonGenerateCharacters && (
        <>
          <div className="my-2 space-y-2">
            <div className="flex justify-center w-full space-x-2">
              <Button
                type="submit"
                disabled={needsNewIndex || buildingIndex || runningQuery || showStoryCharacters}
                onClick={async () => {
                  setAnswer("Running query...");
                  setRunningQuery(true);
                  // Post the query and nodesWithEmbedding to the server
                  const result = await fetch("/api/retrieveandquery", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      query,
                      nodesWithEmbedding,
                      topK: parseInt(topK),
                      temperature: parseFloat(temperature),
                      topP: parseFloat(topP),
                    }),
                  });

                  const { error, payload } = await result.json();

                  if (error) {
                    setAnswer(error);
                  }

                  if (payload) {
                    setAnswer(payload.response);
                    const charactersArray = JSON.parse(payload.response);
                    console.log(charactersArray);
                    setCharacters(charactersArray.characters);
                    setShowStoryCharacters(true);
                  }

                  setRunningQuery(false);
                }}
              >
                Extract Characters From Story
              </Button>
            </div>
          </div>
        </>
      )}

      {showStoryCharacters && (<div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">2. Story Characters</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 mb-6 flex items-center"
        >
          Add New Character
        </button>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Personality:</label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200"
              >
                {editingCharacter ? 'Update' : 'Add'}
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {characters.map(character => (
            <div key={character.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{character.name}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Description:</h3>
                  <p className="text-gray-700">{character.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Personality:</h3>
                  <p className="text-gray-700">{character.personality}</p>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleEdit(character)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(character.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {characters.length > 0 && (
          <div>
            <button onClick={() => {
              reload();
              append({
                role: "user",
                content: "Generate a very short story with the following characters : " + characters.map(character => `naam: ${character.name}, beschrijving: ${character.description}, persoonlijkheid: ${character.personality}`).join("/ ")
              })
            }}
              className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 text-lg font-semibold"
            >
              3. Generate Story
            </button>
            <div
              hidden={
                messages.length === 0 ||
                messages[messages.length - 1]?.content.startsWith("Generate")
              }
              className="bg-opacity-25 bg-gray-700 rounded-lg p-4"
            >
              {messages[1]?.content}
            </div>
          </div>
        )}

        {messages.length >= 2 && (
          <div>
            <button onClick={() => {
              append({
                role: "user",
                content: "Summarize each character's role in the story."
              })
            }}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 text-lg font-semibold"
            >
              Summarize Characters
            </button>
            <div
              hidden={
                messages.length < 4
              }
              className="bg-opacity-25 bg-gray-700 rounded-lg p-4"
            >
              {messages[3]?.content}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
