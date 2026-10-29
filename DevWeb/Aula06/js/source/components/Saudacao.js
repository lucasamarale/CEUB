import React from 'react';

// Componente sem estado: recebe dados por props e só os exibe.
export default function Saudacao(props) {
  return (
    <p className="cartao">
      Olá, <strong>{props.nome}</strong>. Esta página foi montada pelo React, a partir de JSX
      traduzido pelo Babel e empacotado pelo Browserify.
    </p>
  );
}
