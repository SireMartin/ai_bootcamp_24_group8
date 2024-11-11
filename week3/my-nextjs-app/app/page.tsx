"use client";

import { useChat } from "ai/react";
import { useState } from "react";

interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
  });
  const { messages, append, reload } = useChat({ api: "/api" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCharacter) {
      setCharacters(
        characters.map((char) =>
          char.id === editingCharacter.id ? { ...formData, id: char.id } : char
        )
      );
      setEditingCharacter(null);
    } else {
      setCharacters([...characters, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
    setFormData({ name: "", description: "", personality: "" });
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData(character);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this character?")) {
      setCharacters(characters.filter((char) => char.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-extrabold mb-4 text-teal-800">
        Manage Your Story Characters
      </h1>
      <p className="text-gray-600 mb-6">
        Add, edit, or remove your characters below. When you are ready, generate
        a unique story that brings your characters to life!
      </p>

      <button
        onClick={() => setShowForm(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 mb-5"
      >
        Add Character
      </button>

      {showForm && (
        <div className="bg-gray-50 rounded-md shadow-lg p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-teal-800 block mb-1">
                Character Name:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-teal-800 block mb-1">
                Description:
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-teal-800 block mb-1">
                Personality:
              </label>
              <textarea
                value={formData.personality}
                onChange={(e) =>
                  setFormData({ ...formData, personality: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
            >
              {editingCharacter ? "Update Character" : "Add Character"}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {characters.map((character) => (
          <div
            key={character.id}
            className="bg-white rounded-md shadow-lg p-5 hover:shadow-xl transition-shadow duration-200 border-l-4 border-teal-500"
          >
            <h2 className="text-2xl font-semibold text-teal-700 mb-3">
              {character.name}
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Description:
                </h3>
                <p className="text-gray-800">{character.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Personality:
                </h3>
                <p className="text-gray-800">{character.personality}</p>
              </div>
            </div>
            <div className="mt-5 flex space-x-2">
              <button
                onClick={() => handleEdit(character)}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded-md shadow-sm transition-all duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(character.id)}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-md shadow-sm transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {characters.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => {
              reload();
              append({
                role: "user",
                content:
                  "Imagine an adventurous story involving the following characters. Each character has their own unique role in this story, and their personality should shine through. Here are the characters: " +
                  characters
                    .map(
                      (character) =>
                        `Character name: ${character.name}. Description: ${character.description}. Personality traits: ${character.personality}`
                    )
                    .join("; ") +
                  ". Develop a compelling story where each character has an important role.",
              });
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-md shadow-sm transition-all duration-200 text-lg font-semibold"
          >
            Generate Story
          </button>
          <div
            hidden={
              messages.length === 0 ||
              messages[messages.length - 1]?.content.startsWith("Imagine")
            }
            className="bg-opacity-25 bg-gray-700 rounded-lg p-4 mt-4 text-white"
          >
            {messages[1]?.content}
          </div>
        </div>
      )}

      {messages.length >= 2 && (
        <div>
          <button
            onClick={() => {
              append({
                role: "user",
                content:
                  "Provide a detailed summary of each character's contribution to the story. Highlight their key actions and interactions with other characters.",
              });
            }}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-sm transition-all duration-200 text-lg font-semibold"
          >
            Summarize Characters
          </button>
          <div
            hidden={messages.length < 4}
            className="bg-opacity-25 bg-gray-700 rounded-lg p-4 mt-4 text-white"
          >
            {messages[3]?.content}
          </div>
        </div>
      )}
    </div>
  );
}
