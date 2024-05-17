import React, {useEffect, useState} from 'react';
import useFetch from "../useFetch";
import {Badge, ListGroup, Button} from "react-bootstrap";

const OrderPizza = ({fetchPost, userId}) => {

  const {data: pizzas, loading: loading, error: error} = useFetch('http://localhost:9000/client/available_pizzas');
  const [pizzasInBasket, setPizzasInBasket] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [fetchPostError, setFetchPostError] = useState(null);

  const addToBasket = (menu_number) => {
    const basketPos = pizzasInBasket.filter((item) => item.menu_number === menu_number)[0];
    console.log("basketPos"+JSON.stringify(basketPos));
    const basketWithoutPos = pizzasInBasket.filter((item) => item.menu_number !== menu_number);
    if (basketPos) {
      basketPos.count += 1;
      basketWithoutPos.push(basketPos);
      setPizzasInBasket(basketWithoutPos);
    } else {
      setPizzasInBasket([...pizzasInBasket, {menu_number: menu_number, count: 1}])
    }
  }

  const removeFromBasket = (menu_number) => {
    const basketPos = pizzasInBasket.filter((item) => item.menu_number === menu_number)[0];
    console.log(basketPos);
    const basketWithoutPos = pizzasInBasket.filter((item) => item.menu_number !== menu_number);
    if (basketPos) {
      basketPos.count -= 1;
      if (basketPos.count > 0) {
        basketWithoutPos.push(basketPos);
        setPizzasInBasket(basketWithoutPos);
      } else {
        setPizzasInBasket(basketWithoutPos);
      }
    }
  }

  const saveOrder = async (event) => {
    setFetchPostError(null);
    event.preventDefault();
    console.log(userId);
    let confirm = window.prompt('Potwierdź operację, wpisz "Confirm"');
    if (confirm === 'Confirm') {
      const res = await fetchPost('http://localhost:9000/client/save_order', {
        userId: userId,
        pizzasInBasket: pizzasInBasket
      });
      if (!res.error) {
        if (res.data.message) {
          setStatusMessage(res.data.message);
        }
      } else {
        setFetchPostError(res.error);
      }
    }
  }

  return (
    <div>
      <ListGroup as="ol" numbered>
        {pizzas && pizzas
          .filter((pizza) => pizza.availableIngredients.filter((item) => item.onStock === false).length === 0)
          .map(pizza => (
          <ListGroup.Item key={pizza.menu_number} as="li"
                          className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">{pizza.name}</div>
              Składniki: {pizza.availableIngredients.map((item) => item.name).join(", ")}, Cena: {pizza.price}
            </div>
            <Badge bg="success" className="me-2 badge-hover" onClick={() => addToBasket(pizza.menu_number)} pill>
              +
            </Badge>
            <Badge bg="danger" className="me-2 badge-hover" onClick={() => removeFromBasket(pizza.menu_number)} pill>
              -
            </Badge>
            <Badge bg="primary" pill>
              {pizzasInBasket.filter((item) => item.menu_number === pizza.menu_number)[0] ?
                pizzasInBasket.filter((item) => item.menu_number === pizza.menu_number)[0].count : 0}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button variant="success" className="mt-4" onClick={saveOrder}>Submit</Button>
      {pizzasInBasket && <p>{JSON.stringify(pizzasInBasket)}</p>}
      {statusMessage && <p>{statusMessage}</p>}
      {fetchPostError && <p>{fetchPostError}</p>}
    </div>
  );
};

export default OrderPizza;
