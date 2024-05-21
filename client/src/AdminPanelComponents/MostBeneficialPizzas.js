import React, {useEffect, useState} from 'react';
import useFetch from "../useFetch";
import {Button, Form, ListGroup} from "react-bootstrap";

const MostBeneficialPizzas = ({fetchPost}) => {

  const [mostBeneficialPizzasNumber, setMostBeneficialPizzasNumber] = useState(0);
  const [error, setError] = useState(null);
  const [mostBeneficialPizzas, setMostBeneficialPizzas] = useState([]);

  useEffect(() => {
    console.log(mostBeneficialPizzas);
  }, [mostBeneficialPizzas]);

  const fetchMostBeneficialPizzas = async (event) => {
    event.preventDefault();
    let confirm = window.prompt('Potwierdź operację, wpisz "Confirm"');
    if (confirm === 'Confirm') {
      const res = await fetchPost('http://localhost:9000/admin/most_beneficial_pizzas', {
        show_pizzas_no: mostBeneficialPizzasNumber
      });
      if (!res.error) {
        setMostBeneficialPizzas(res.data);
      } else {
        setError(res.error);
      }
    }
  }

  return (
    <div>
      {error && <p>{error}</p>}
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Podaj ilość pizz:</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setMostBeneficialPizzasNumber(Number(event.target.value));
          }}/>
        </Form.Group>
      </Form>
      <Button className="mb-3" onClick={fetchMostBeneficialPizzas}>Pokaż</Button>
      <ListGroup className="mb-3" controlId="exampleForm.ControlList">
        {mostBeneficialPizzas && mostBeneficialPizzas.map((pizza) => (
          <ListGroup.Item key={pizza.menu_number}>
            <p>Nazwa pizzy: <b>{pizza.name}</b>, cena: {pizza.price}zł, całkowita liczba zamówień: {pizza.has_been_ordered_count}, całkowity zysk: <b>{pizza.total_benefit}zł</b></p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default MostBeneficialPizzas;
