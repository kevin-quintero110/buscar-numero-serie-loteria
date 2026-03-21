import React, { useState, useEffect, useRef } from "react";
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
  const [touchCandidateNum, setTouchCandidateNum] = useState(null);
  const [touchDragNum, setTouchDragNum] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isTouchDragActive, setIsTouchDragActive] = useState(false);
  const touchHoldTimeout = useRef(null);
  const [alertaMsg, setAlertaMsg] = useState(null);

  useEffect(() => {
    localStorage.setItem("numeros", JSON.stringify(numeros));
  }, [numeros]);

  useEffect(() => {
    localStorage.setItem("posicionesAnteriores", JSON.stringify(posicionesAnteriores));
  }, [posicionesAnteriores]);

  // Agregar listener global para touch move y end
  useEffect(() => {
    const gridElement = document.querySelector('.grid');

    const handleGlobalTouchMove = (e) => {
      if (!modoManual) return;
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);

      if (!isTouchDragActive) {
        if (!touchCandidateNum) return;

        // Desplazamiento natural: si mueve más de 6px, cancelar intent de arrastre
        if (deltaY > 8 || deltaX > 8) {
          clearTimeout(touchHoldTimeout.current);
          setTouchCandidateNum(null);
          setTouchDragNum(null);
          setDropTarget(null);
          setIsTouchDragActive(false);
          return;
        }
        return;
      }

      if (!touchDragNum) return;

      e.preventDefault();
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (element && element.id) {
        const targetNum = element.id;
        if (targetNum && touchDragNum !== targetNum) {
          setDropTarget(targetNum);
        }
      }

      // Auto-scroll cuando se arrastra cerca de los bordes
      if (gridElement) {
        const gridRect = gridElement.getBoundingClientRect();
        const touchY = touch.clientY;
        const scrollThreshold = 80; // píxeles desde borde para activar scroll

        if (touchY < gridRect.top + scrollThreshold && gridElement.scrollTop > 0) {
          // Scroll hacia arriba
          gridElement.scrollTop -= 10;
        } else if (touchY > gridRect.bottom - scrollThreshold && gridElement.scrollTop < gridElement.scrollHeight - gridElement.clientHeight) {
          // Scroll hacia abajo
          gridElement.scrollTop += 10;
        }
      }
    };

    const handleGlobalTouchEnd = () => {
      clearTimeout(touchHoldTimeout.current);

      if (!modoManual) {
        setTouchCandidateNum(null);
        setTouchDragNum(null);
        setDropTarget(null);
        setIsTouchDragActive(false);
        return;
      }

      if (!isTouchDragActive) {
        setTouchCandidateNum(null);
        setTouchDragNum(null);
        setDropTarget(null);
        return;
      }

      if (!dropTarget) {
        setTouchCandidateNum(null);
        setTouchDragNum(null);
        setDropTarget(null);
        setIsTouchDragActive(false);
        return;
      }

      const nuevaLista = [...numeros];
      const draggedIndex = nuevaLista.indexOf(touchDragNum);
      const targetIndex = nuevaLista.indexOf(dropTarget);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const nuevasPosiciones = { ...posicionesAnteriores };
        if (!nuevasPosiciones[touchDragNum]) nuevasPosiciones[touchDragNum] = [];
        nuevasPosiciones[touchDragNum].push(draggedIndex);
        setPosicionesAnteriores(nuevasPosiciones);

        nuevaLista.splice(draggedIndex, 1);
        nuevaLista.splice(targetIndex, 0, touchDragNum);
        setNumeros(nuevaLista);
        setHighlight(touchDragNum);
        setUltimoMovido([touchDragNum]);
      }

      setTouchDragNum(null);
      setDropTarget(null);
    };

    if (modoManual) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
      document.addEventListener('touchend', handleGlobalTouchEnd);
      document.addEventListener('touchcancel', handleGlobalTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
        document.removeEventListener('touchcancel', handleGlobalTouchEnd);
      };
    }
  }, [touchDragNum, touchCandidateNum, modoManual, numeros, posicionesAnteriores, dropTarget, isTouchDragActive, touchStartX, touchStartY]);

  const moverAlFinal = () => {
    if (!input.trim()) {
      setAlertaMsg("❌ Por favor ingresa un número para mover");
      setTimeout(() => setAlertaMsg(null), 3000);
      return;
    }

    const inputs = input.split(',').map(s => s.trim()).filter(s => s !== '');
    const validInputs = inputs.filter(num => numeros.includes(num));
    
    if (validInputs.length === 0) {
      setAlertaMsg("❌ Ninguno de los números ingresados existe");
      setTimeout(() => setAlertaMsg(null), 3000);
      return;
    }

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
      setAlertaMsg(`✅ ${validInputs.length} número(s) movido(s) al final`);
      setTimeout(() => setAlertaMsg(null), 2000);
      setTimeout(() => {
        document.getElementById(validInputs[validInputs.length - 1])?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const buscarNumero = () => {
    if (!input.trim()) {
      setAlertaMsg("❌ Por favor ingresa un número para buscar");
      setTimeout(() => setAlertaMsg(null), 3000);
      return;
    }

    if (numeros.includes(input)) {
      setHighlight(input);
      setAlertaMsg(`✅ Número ${input} encontrado`);
      setTimeout(() => setAlertaMsg(null), 2000);
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      setAlertaMsg(`❌ Número ${input} no existe`);
      setTimeout(() => setAlertaMsg(null), 3000);
    }
  };

  // 👇 Nueva función: restaurar número a su posición anterior
  const restaurarNumero = () => {
    if (!input.trim()) {
      setAlertaMsg("❌ Por favor ingresa un número para restaurar");
      setTimeout(() => setAlertaMsg(null), 3000);
      return;
    }

    const posArray = posicionesAnteriores[input];
    if (!posArray || posArray.length === 0) {
      setAlertaMsg(`❌ No hay historial de movimiento para ${input}`);
      setTimeout(() => setAlertaMsg(null), 3000);
      return;
    }

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
      setAlertaMsg(`✅ ${input} restaurado a posición anterior`);
      setTimeout(() => setAlertaMsg(null), 2000);
      setTimeout(() => {
        document.getElementById(input)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  // 👇 Nueva función: restaurar la serie completa
  const restaurarSerieCompleta = () => {
    const confirmacion = window.confirm("¿Estás seguro de restaurar la serie completa desde 0? Esto reiniciará toda la lista de números.");
    if (!confirmacion) {
      setAlertaMsg("↩️ Restaurar serie completa cancelada.");
      setTimeout(() => setAlertaMsg(null), 2000);
      return;
    }

    setNumeros(listaInicial);
    setPosicionesAnteriores({});
    setHighlight(null);
    setUltimoMovido(null);
    setAlertaMsg("✅ Serie completa restaurada a cero.");
    setTimeout(() => setAlertaMsg(null), 2000);
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

  // 👇 Funciones para Touch Events en móvil
  const handleTouchStart = (e, num) => {
    if (!modoManual) return;
    const touch = e.touches[0];
    setTouchCandidateNum(num);
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setIsTouchDragActive(false);

    if (touchHoldTimeout.current) {
      clearTimeout(touchHoldTimeout.current);
    }

    touchHoldTimeout.current = setTimeout(() => {
      setTouchDragNum(num);
      setIsTouchDragActive(true);
    }, 220);
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
      {alertaMsg && (
        <div className="alerta">
          {alertaMsg}
        </div>
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
            className={`celda ${num === highlight ? "resaltado" : ""} ${modoManual ? "arrastrable" : ""} ${draggedNum === num ? "dragged" : modoManual ? "white-bg" : ""} ${num === ultimoMovido ? "ultimo-movido" : ""} ${dropTarget === num || touchDragNum === num ? "drop-target" : ""}`}
            draggable={modoManual}
            onDragStart={modoManual ? (e) => { e.dataTransfer.setData('text/plain', num); setDraggedNum(num); } : undefined}
            onDragOver={modoManual ? (e) => e.preventDefault() : undefined}
            onDragEnter={modoManual ? () => setDropTarget(num) : undefined}
            onDragLeave={modoManual ? () => setDropTarget(null) : undefined}
            onDrop={modoManual ? (e) => handleDrop(e, num) : undefined}
            onDragEnd={modoManual ? () => { setDraggedNum(null); setDropTarget(null); } : undefined}
            onTouchStart={modoManual ? (e) => handleTouchStart(e, num) : undefined}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}