import React from 'react';
import {ListGroup} from "react-bootstrap";
import useFetch from "../useFetch";

const ShowPizzas = () => {
  const {data: pizzas, loading: loading, error: error} = useFetch('http://localhost:9000/admin/pizzas');

  return (
    <div>
      <ListGroup>
        {pizzas && pizzas.map(pizza => (
          <ListGroup.Item key={pizza._id} as="li">Nazwa pizzy: {pizza.name}; Składniki: {pizza.ingredients.map((item) => item.name).join(", ")}; Cena: {pizza.price}; Zamówiono razy: {pizza.has_been_ordered_count}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ShowPizzas;
