import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [numeros, setNumeros] = useState(
    () =>
      JSON.parse(localStorage.getItem("numeros")) ||
      Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, "0"))
  );
  const [highlight, setHighlight] = useState(null);
  const [input, setInput] = useState("");

  // Guarda cambios en localStorage
  useEffect(() => {
    localStorage.setItem("numeros", JSON.stringify(numeros));
  }, [numeros]);

  const moverAlFinal = () => {
    if (numeros.includes(input)) {
      const nuevaLista = numeros.filter((n) => n !== input);
      nuevaLista.push(input);
      setNumeros(nuevaLista);
      setHighlight(input);
      // Scroll al final
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const buscarNumero = () => {
    if (numeros.includes(input)) {
      setHighlight(input);
      // Scroll al número encontrado
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  return (
    <div className="app">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite un número (000-999)"
        className="input"
      />
      <div className="botones">
        <button onClick={moverAlFinal}>Mover al final</button>
        <button onClick={buscarNumero}>Buscar número</button>
      </div>
      <div className="grid">
        {numeros.map((num) => (
          <div
            key={num}
            id={num} // 👈 ID único para scroll
            className={`celda ${num === highlight ? "resaltado" : ""}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}