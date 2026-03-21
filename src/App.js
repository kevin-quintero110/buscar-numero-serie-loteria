import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const listaInicial = Array.from({ length: 1000 }, (_, i) =>
    i.toString().padStart(3, "0")
  );

  const [numeros, setNumeros] = useState(
    () => JSON.parse(localStorage.getItem("numeros")) || listaInicial
  );
  const [posicionesAnteriores, setPosicionesAnteriores] = useState(
    () => {
      const stored = JSON.parse(localStorage.getItem("posicionesAnteriores")) || {};
      // Convertir arrays si es necesario, pero por ahora asumir objeto
      return stored;
    }
  );
  const [modoManual, setModoManual] = useState(false);
  const [draggedNum, setDraggedNum] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [ultimoMovido, setUltimoMovido] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("numeros", JSON.stringify(numeros));
  }, [numeros]);

  useEffect(() => {
    localStorage.setItem("posicionesAnteriores", JSON.stringify(posicionesAnteriores));
  }, [posicionesAnteriores]);

  const moverAlFinal = () => {
    const inputs = input.split(',').map(s => s.trim()).filter(s => s !== '');
    const validInputs = inputs.filter(num => numeros.includes(num));
    
    if (validInputs.length > 0) {
      // Guardar posiciones anteriores
      const nuevasPosiciones = { ...posicionesAnteriores };
      validInputs.forEach(num => {
        if (!nuevasPosiciones[num]) nuevasPosiciones[num] = [];
        nuevasPosiciones[num].push(numeros.indexOf(num));
      });
      setPosicionesAnteriores(nuevasPosiciones);

      let nuevaLista = [...numeros];
      // Remover los números válidos
      nuevaLista = nuevaLista.filter(n => !validInputs.includes(n));
      // Agregarlos al final
      nuevaLista.push(...validInputs);
      setNumeros(nuevaLista);
      // Resaltar el último movido
      setHighlight(validInputs[validInputs.length - 1]);
      setUltimoMovido(validInputs);
      setTimeout(() => {
        document.getElementById(validInputs[validInputs.length - 1])?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  // 👇 Nueva función: restaurar número a su posición anterior
  const restaurarNumero = () => {
    const posArray = posicionesAnteriores[input];
    if (posArray && posArray.length > 0) {
      const indexAnterior = posArray.pop();
      const nuevaLista = [...numeros];
      // Remover el número de su posición actual
      const indexActual = nuevaLista.indexOf(input);
      if (indexActual !== -1) {
        nuevaLista.splice(indexActual, 1);
      }
      // Insertar en la posición anterior
      nuevaLista.splice(indexAnterior, 0, input);
      setNumeros(nuevaLista);
      // Si el array está vacío, eliminar la entrada
      const nuevasPosiciones = { ...posicionesAnteriores };
      if (posArray.length === 0) {
        delete nuevasPosiciones[input];
      }
      setPosicionesAnteriores(nuevasPosiciones);
      setHighlight(input);
      setUltimoMovido([input]);
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  // 👇 Nueva función: restaurar la serie completa
  const restaurarSerieCompleta = () => {
    setNumeros(listaInicial);
    setPosicionesAnteriores({});
    setHighlight(null);
    setUltimoMovido(null);
  };

  // 👇 Nueva función: manejar el drop en drag and drop
  const handleDrop = (e, targetNum) => {
    e.preventDefault();
    const draggedNum = e.dataTransfer.getData('text/plain');
    if (draggedNum && draggedNum !== targetNum) {
      const nuevaLista = [...numeros];
      const draggedIndex = nuevaLista.indexOf(draggedNum);
      const targetIndex = nuevaLista.indexOf(targetNum);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Guardar posición anterior
        const nuevasPosiciones = { ...posicionesAnteriores };
        if (!nuevasPosiciones[draggedNum]) nuevasPosiciones[draggedNum] = [];
        nuevasPosiciones[draggedNum].push(draggedIndex);
        setPosicionesAnteriores(nuevasPosiciones);

        // Remover el arrastrado
        nuevaLista.splice(draggedIndex, 1);
        // Insertar en la nueva posición
        nuevaLista.splice(targetIndex, 0, draggedNum);
        setNumeros(nuevaLista);
        setHighlight(draggedNum);
        setUltimoMovido([draggedNum]);
      }
    }
  };

  return (
    <div className="app">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite un número o varios separados por comas (000-999)"
        className="input"
      />
      {ultimoMovido && ultimoMovido.length > 0 && (
        <div className="mensaje-ultimo">Último número movido: {ultimoMovido.join(', ')}</div>
      )}
      <div className="botones">
        <button onClick={moverAlFinal}>➡️ Mover al final</button>
        <button onClick={buscarNumero}>🔍 Buscar número</button>
        <button onClick={restaurarNumero}>↩️ Restaurar número</button>
        <button onClick={restaurarSerieCompleta}>🔄 Restaurar serie completa</button>
        <button 
          onClick={() => setModoManual(!modoManual)}
          className={`modo-manual ${modoManual ? "activo" : "inactivo"}`}
        >
          {modoManual ? '❌ Desactivar mover manual' : '🖱️ Moverlo manual'}
        </button>
      </div>
      <div className="grid">
        {numeros.map((num) => (
          <div
            key={num}
            id={num}
            className={`celda ${num === highlight ? "resaltado" : ""} ${modoManual ? "arrastrable" : ""} ${draggedNum === num ? "dragged" : modoManual ? "white-bg" : ""} ${num === ultimoMovido ? "ultimo-movido" : ""} ${dropTarget === num ? "drop-target" : ""}`}
            draggable={modoManual}
            onDragStart={modoManual ? (e) => { e.dataTransfer.setData('text/plain', num); setDraggedNum(num); } : undefined}
            onDragOver={modoManual ? (e) => e.preventDefault() : undefined}
            onDragEnter={modoManual ? () => setDropTarget(num) : undefined}
            onDragLeave={modoManual ? () => setDropTarget(null) : undefined}
            onDrop={modoManual ? (e) => handleDrop(e, num) : undefined}
            onDragEnd={modoManual ? () => { setDraggedNum(null); setDropTarget(null); } : undefined}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}