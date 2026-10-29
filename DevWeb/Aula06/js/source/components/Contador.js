import React, { useState } from 'react';
import Botao from './Botao';

// Componente com estado: quando o estado muda, o React recalcula a interface
// e atualiza no DOM real apenas o número que mudou.
export default function Contador(props) {
  const [valor, setValor] = useState(props.inicial);

  return (
    <section className="cartao">
      <h2>Estado na prática</h2>
      <p className="contador">{valor}</p>
      <div className="acoes">
        <Botao rotulo="Diminuir" onClick={() => setValor(valor - 1)} />
        <Botao rotulo="Zerar" onClick={() => setValor(props.inicial)} />
        <Botao rotulo="Aumentar" onClick={() => setValor(valor + 1)} />
      </div>
    </section>
  );
}
