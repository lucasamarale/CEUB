import React from 'react';

export default function Botao(props) {
  return (
    <button type="button" className="botao" onClick={props.onClick}>
      {props.rotulo}
    </button>
  );
}
