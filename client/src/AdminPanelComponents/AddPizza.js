import React, {useState} from 'react';
import {Button, Form} from "react-bootstrap";
import useFetch from "../useFetch";

const AddPizza = ({fetchPost}) => {
  const {data: ingredients, loading: ingredientsLoading, error: ingredientsError} = useFetch("http://localhost:9000/admin/ingredients");
  const [pizzaName, setPizzaName] = useState("");
  const [pizzaIngredients, setPizzaIngredients] = useState([]);
  const [pizzaPrice, setPizzaPrice] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  const addPizza = async (event) => {
    setError(null);
    setStatusMessage(null);
    event.preventDefault();
    let confirm = window.prompt('Potwierdź operację, wpisz "Confirm"');
    if (confirm === 'Confirm') {
      const res = await fetchPost('http://localhost:9000/admin/add_pizza', {
        name: pizzaName,
        ingredients: pizzaIngredients,
        price: pizzaPrice
      });
      if (!res.error) {
        if (res.data.message) {
          setStatusMessage(res.data.message);
        }
      } else {
        setError(res.error);
      }
    }
  }
  return (
    <div>
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Nazwa pizzy</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setPizzaName(event.target.value);
            setStatusMessage('');
            setError('');
          }}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
          {ingredients && ingredients.map((ingredient) => (
            <Form.Check id={ingredient.id} type="checkbox" label={ingredient.name} onChange={(event) => {
              if (event.target.checked) {
                setPizzaIngredients([...pizzaIngredients, ingredient.id]);
              } else {
                setPizzaIngredients(pizzaIngredients.filter((item) => item !== ingredient.id))
              }
            }}/>
          ))}
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
          <Form.Label>Cena</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setPizzaPrice(Number(event.target.value))
            setStatusMessage('');
            setError('');
          }}/>
        </Form.Group>
        <Button variant="primary" onClick={addPizza}>Submit</Button>
      </Form>
      {statusMessage && <p>{statusMessage}</p>}
      {error && <p>{error}</p>}
      <p>{pizzaIngredients}</p>
    </div>
  );
};

export default AddPizza;
