import React from 'react';

// Renderiza uma lista a partir de um array. A key ajuda o Virtual DOM
// a saber qual item mudou sem redesenhar a lista inteira.
export default function ListaDisciplinas(props) {
  return (
    <section className="cartao">
      <h2>Disciplinas do semestre</h2>
      <ul>
        {props.itens.map((nome) => <li key={nome}>{nome}</li>)}
      </ul>
    </section>
  );
}
