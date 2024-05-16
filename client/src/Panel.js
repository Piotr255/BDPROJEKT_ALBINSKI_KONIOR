import React, {useEffect, useState} from 'react';
import OrderPizza from "./ClientPanelComponents/OrderPizza";
import AddPizza from "./AdminPanelComponents/AddPizza";
import ShowPizzas from "./AdminPanelComponents/ShowPizzas";
import AddIngredient from "./AdminPanelComponents/AddIngredient";
import MyOrders from "./ClientPanelComponents/MyOrders";

const Panel = ({userType, userId, fetchPost}) => {
  const [chosenPanel, setChosenPanel] = useState(null);

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
          <option value="My-Orders" onClick={() => setChosenPanel('MyOrders')}>My orders</option>
        </select>
      )}
      {userType === 'Admin' && (
        <select className="w-100 text-center font-size-24">
          <option value="Add-pizza" onClick={() => setChosenPanel('AddPizza')}>Add pizza</option>
          <option value="Show-pizzas" onClick={() => setChosenPanel('ShowPizzas')}>Show pizzas</option>
          <option value="Add-ingredient" onClick={() => setChosenPanel('AddIngredient')}>Add ingredient</option>
        </select>
      )}

      {/* Dodatkowy tekst */}
      <h3>Formularz/dane operacji: </h3>

      {userType === 'Client' && chosenPanel === 'OrderPizza' && (
        <OrderPizza key={1} fetchPost = {fetchPost} userId={userId} />
      )}
      {userType === 'Client' && chosenPanel === 'MyOrders' && (
        <MyOrders key={1} fetchPost = {fetchPost} userId={userId} />
      )}
      {userType === 'Admin' && chosenPanel === 'AddPizza' && (
        <AddPizza key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'Admin' && chosenPanel === 'ShowPizzas' && (
        <ShowPizzas key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'Admin' && chosenPanel === 'AddIngredient' && (
        <AddIngredient key={1} fetchPost = {fetchPost} />
      )}
    </div>
  );
};

export default Panel;
