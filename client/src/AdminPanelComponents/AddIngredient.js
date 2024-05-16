import React, {useState} from 'react';
import {Button, Form} from "react-bootstrap";

const AddIngredient = ({fetchPost}) => {

  const [ingredientName, setIngredientName] = useState("");
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const addIngredient = async (event) => {
    setError(null);
    setStatusMessage(null);
    event.preventDefault();
    let confirm = window.prompt('Potwierdź operację, wpisz "Confirm"');
    if (confirm === 'Confirm') {
      const res = await fetchPost('http://localhost:9000/admin/add_ingredient', {
        name: ingredientName
      })
      console.log(res);
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
          <Form.Label>Nazwa składnika</Form.Label>
          <Form.Control type="text" onInput={(event) => {
            setIngredientName(event.target.value);
            setStatusMessage('');
          }}/>
        </Form.Group>
        <Button variant="primary" onClick={addIngredient}>Submit</Button>
      </Form>
      {statusMessage && <p>{statusMessage}</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default AddIngredient;