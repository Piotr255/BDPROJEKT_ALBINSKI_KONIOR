import React, {useEffect, useState} from 'react';
import useFetch from "../useFetch";
import {Button, ListGroup} from "react-bootstrap";

const UpdateIngredientsStatus = ({fetchPost}) => {

  const {data: ingredients, loading: loading, error: error} = useFetch('http://localhost:9000/employee/getIngredients');
  const [fetchPostError, setFetchPostError] = useState(null);
  const changeIngredientStatus = async (ingredient_id, on_stock) => {
    setFetchPostError(null);
    let confirm = window.prompt('Potwierdź operację, wpisz "Confirm"');
    if (confirm === 'Confirm') {
      const res = await fetchPost('http://localhost:9000/employee/changeIngredientsStatus', {
        id: ingredient_id,
        new_status: !on_stock
      });
      if (res.error) {
        setFetchPostError(res.error);
      }
    }
  }
  return (
    <div>
      {fetchPostError && <p>{fetchPostError}</p>}
      <ListGroup as="ol" numbered>
        {ingredients && ingredients.map((ingredient) => (
            <ListGroup.Item as="li" key={ingredient.id}>
              <p>Nazwa składnika: <b>{ingredient.name}</b></p>
              {ingredient.onStock ? <p>Status: <b>dostępny</b></p> : <p>Status: <b>niedostępny</b></p>}
              <Button onClick={() => changeIngredientStatus(ingredient.id, ingredient.onStock)}>Zmień status</Button>
            </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default UpdateIngredientsStatus;
