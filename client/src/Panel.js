import React, {useEffect, useState} from 'react';
import OrderPizza from "./ClientPanelComponents/OrderPizza";
import AddPizza from "./AdminPanelComponents/AddPizza";
import ShowPizzas from "./AdminPanelComponents/ShowPizzas";

const Panel = ({userType}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chosenPanel, setChosenPanel] = useState(null);

  const fetchPost = async (url, body) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (error) {
      setError(error.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Nagłówek strony - nazwa panelu */}
      {userType === 'Client' && (
        <h1>Panel klienta</h1>
      )}
      {userType === 'Admin' && (
        <h1>Panel administratora</h1>
      )}

      {/* Dodatkowy napis */}
      <h3>Wybierz operację: </h3>

      {/* Select - wybór operacji */}
      {userType === 'Client' && (
        <select className="w-100 text-center font-size-24">
          <option value="Order-pizza" onClick={() => setChosenPanel('OrderPizza')}>Order pizza</option>
        </select>
      )}
      {userType === 'Admin' && (
        <select className="w-100 text-center font-size-24">
          <option value="Add-pizza" onClick={() => setChosenPanel('AddPizza')}>Add pizza</option>
          <option value="Show-pizzas" onClick={() => setChosenPanel('ShowPizzas')}>Show pizzas</option>
        </select>
      )}

      {/* Dodatkowy tekst */}
      <h3>Formularz/dane operacji: </h3>

      {userType === 'Client' && chosenPanel === 'OrderPizza' && (
        <OrderPizza key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'Admin' && chosenPanel === 'AddPizza' && (
        <AddPizza key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'Admin' && chosenPanel === 'ShowPizzas' && (
        <ShowPizzas key={1} fetchPost = {fetchPost} />
      )}
    </div>
  );
};

export default Panel;
