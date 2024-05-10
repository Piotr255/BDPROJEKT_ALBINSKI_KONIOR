import React, {useEffect} from 'react';
import useFetch from "../useFetch";
import {Badge, ListGroup} from "react-bootstrap";

const OrderPizza = () => {

  const {data: pizzas, loading: loading, error: error} = useFetch('http://localhost:9000/pizzas');

  return (
    <div>
      <ListGroup as="ol" numbered>
        {pizzas && pizzas.map(pizza => (
          <ListGroup.Item key={pizza.id} as="li"
                          className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">{pizza.name}</div>
              Składniki: {pizza.ingredients}, Cena: {pizza.price}
            </div>
            <Badge bg="primary" pill>
              0
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default OrderPizza;
