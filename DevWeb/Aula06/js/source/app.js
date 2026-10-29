import React from 'react';
import { createRoot } from 'react-dom/client';
import Saudacao from './components/Saudacao';
import ListaDisciplinas from './components/ListaDisciplinas';
import Contador from './components/Contador';

const disciplinas = [
  'Desenvolvimento Web',
  'Análise e Projeto de Sistemas',
  'Integração DevOps',
  'Bootcamp III',
];

function App() {
  return (
    <main className="app">
      <h1>Hello World!</h1>
      <Saudacao nome="turma de Desenvolvimento Web" />
      <ListaDisciplinas itens={disciplinas} />
      <Contador inicial={0} />
    </main>
  );
}

createRoot(document.getElementById('app')).render(<App />);
