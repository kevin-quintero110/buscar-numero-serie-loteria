import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const listaInicial = Array.from({ length: 1000 }, (_, i) =>
    i.toString().padStart(3, "0")
  );

  const [numeros, setNumeros] = useState(
    () => JSON.parse(localStorage.getItem("numeros")) || listaInicial
  );
  const [highlight, setHighlight] = useState(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("numeros", JSON.stringify(numeros));
  }, [numeros]);

  const moverAlFinal = () => {
    if (numeros.includes(input)) {
      const nuevaLista = numeros.filter((n) => n !== input);
      nuevaLista.push(input);
      setNumeros(nuevaLista);
      setHighlight(input);
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const buscarNumero = () => {
    if (numeros.includes(input)) {
      setHighlight(input);
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  // 👇 Nueva función: restaurar número a su posición original
  const restaurarNumero = () => {
    if (listaInicial.includes(input)) {
      const nuevaLista = numeros.filter((n) => n !== input);
      // Insertar en la posición original
      const indexOriginal = listaInicial.indexOf(input);
      nuevaLista.splice(indexOriginal, 0, input);
      setNumeros(nuevaLista);
      setHighlight(input);
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
        <button onClick={restaurarNumero}>Restaurar número</button>
      </div>
      <div className="grid">
        {numeros.map((num) => (
          <div
            key={num}
            id={num}
            className={`celda ${num === highlight ? "resaltado" : ""}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}