import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Note } from "./types";

interface NoteState {
  notes: Note[];
  tags: string[];
  addNote: (note: Omit<Note, "id" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleTrash: (id: string) => void;
  addTag: (tag: string) => void;
}

const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "Shopping List",
    content:
      "Milk, eggs, bread, apples, bananas, please. Also, don't forget to buy chicken and cabbage for dinner. We also need cereal for tomorrow breakfast.",
    updatedAt: "10:30",
    tags: ["Free"],
    isTrash: false,
  },
  {
    id: "2",
    title: "Project Ideas",
    content:
      "Proposal for a new web service. Using React, Next.js, and Tailwind, with Expo Router for the mobile app. Aiming for an offline-first design using IndexedDB.",
    updatedAt: "Yesterday",
    tags: ["Test", "User"],
    isTrash: false,
  },
  {
    id: "3",
    title: "Diary",
    content:
      "The weather was nice today, so I took a walk in the park. The cherry blossoms were beautiful. On the way back, I stopped at a cafe and finished a book I've been reading. It was a very fulfilling day.",
    updatedAt: "Mar 28",
    tags: ["User"],
    isTrash: false,
  },
  {
    id: "4",
    title: "Meeting Notes",
    content:
      "Confirmation of the agenda for the next meeting. Discussing budget allocation. We plan to discuss progress reports from each department, Q2 KPI settings, and the formulation of a new marketing strategy.",
    updatedAt: "Mar 25",
    tags: ["Test"],
    isTrash: true,
  },
];

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: MOCK_NOTES,
      tags: ["Test", "User", "Free"],
      addNote: (noteData) =>
        set((state) => {
          const newNote: Note = {
            ...noteData,
            id: Math.random().toString(36).substring(2, 11),
            updatedAt: new Date().toISOString(),
          };
          return { notes: [newNote, ...state.notes] };
        }),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
      toggleTrash: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isTrash: !note.isTrash } : note
          ),
        })),
      addTag: (tag) =>
        set((state) => ({
          tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
        })),
    }),
    {
      name: "note-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
