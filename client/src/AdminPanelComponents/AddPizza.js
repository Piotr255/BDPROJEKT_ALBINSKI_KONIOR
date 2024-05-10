import React, {useState} from 'react';
import {Button, Form} from "react-bootstrap";

const AddPizza = ({fetchPost}) => {

  const [pizzaName, setPizzaName] = useState("");
  const [pizzaIngredients, setPizzaIngredients] = useState('');
  const [pizzaPrice, setPizzaPrice] = useState(0);
  const [pizzaSaved, setPizzaSaved] = useState(false);

  const addPizza = (event) => {
    event.preventDefault();
    let confirm = window.prompt('Potwierdź operację, wpisz "Confirm"');
    if (confirm === 'Confirm') {
      fetchPost('http://localhost:9000/add_pizza', {
        name: pizzaName,
        ingredients: pizzaIngredients,
        price: pizzaPrice
      })
      setPizzaSaved(true);
    }
  }
  return (
    <div>
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Nazwa pizzy</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setPizzaName(event.target.value);
            setPizzaSaved(false);
          }}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
          <Form.Label>Składniki</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setPizzaIngredients(event.target.value);
            setPizzaSaved(false);
          }}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
          <Form.Label>Cena</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setPizzaPrice(Number(event.target.value))
            setPizzaSaved(false);
          }}/>
        </Form.Group>
        <Button variant="primary" onClick={addPizza}>Submit</Button>
      </Form>
      {pizzaSaved && <p>Dodano pizzę</p>}
    </div>
  );
};

export default AddPizza;
