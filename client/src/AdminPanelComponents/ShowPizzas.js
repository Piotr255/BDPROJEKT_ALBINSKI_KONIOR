import React from 'react';
import {ListGroup} from "react-bootstrap";
import useFetch from "../useFetch";

const ShowPizzas = () => {
  const {data: pizzas, loading: loading, error: error} = useFetch('http://localhost:9000/pizzas');

  return (
    <div>
      <ListGroup>
        {pizzas && pizzas.map(pizza => (
          <ListGroup.Item key={pizza._id} as="li">Nazwa pizzy: {pizza.name}; Składniki: {pizza.ingredients}; Cena: {pizza.price}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ShowPizzas;
