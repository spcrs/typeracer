import React, { useState } from "react";
import { RoomProvider } from "../../context/RoomContext";
import { useApp } from "../../context/useAppContext";
import { CreateRoom } from "./CreateRoom";
import { JoinRoom } from "./JoinRoom";
import { Lobby } from "./Lobby";
import { useRoom } from "../../context/userRoomContext";

const TeamFlow: React.FC = () => {
  const { roomId, error } = useRoom();
  const { setCurrentScreen } = useApp();
  const [subView, setSubView] = useState<"menu" | "create" | "join">("menu");

  if (roomId) {
    return <Lobby />;
  }

  if (subView === "create") {
    return <CreateRoom onBack={() => setSubView("menu")} />;
  }

  if (subView === "join") {
    return <JoinRoom onBack={() => setSubView("menu")} />;
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 bg-slate-800/60 border border-slate-700 p-8 rounded-3xl shadow-xl">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-1">Multiplayer Mode</h3>
        <p className="text-slate-400 text-sm">Race against friends in a private lobby</p>
      </div>

      {error && (
        <div className="w-full px-4 py-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => setSubView("create")}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-xl shadow-lg transition"
        >
          Create New Room
        </button>
        <button
          onClick={() => setSubView("join")}
          className="w-full py-4 bg-slate-700 hover:bg-slate-600 font-medium text-slate-100 rounded-xl transition"
        >
          Join With Code
        </button>
      </div>

      <button
        onClick={() => setCurrentScreen("home")}
        className="text-xs text-slate-500 hover:text-slate-300 transition"
      >
        ← Return to Mode Selection
      </button>
    </div>
  );
};

export const TeamScreen: React.FC = () => {
  return (
    <RoomProvider>
      <TeamFlow />
    </RoomProvider>
  );
};