import React, {useEffect, useState} from 'react';
import OrderPizza from "./ClientPanelComponents/OrderPizza";
import AddPizza from "./AdminPanelComponents/AddPizza";
import ShowPizzas from "./AdminPanelComponents/ShowPizzas";
import AddIngredient from "./AdminPanelComponents/AddIngredient";
import MyOrders from "./ClientPanelComponents/MyOrders";
import UpdateIngredientsStatus from "./EmployeePanelComponents/UpdateIngredientsStatus";
import MostBeneficialPizzas from "./AdminPanelComponents/MostBeneficialPizzas";
import {Form} from "react-bootstrap";
const Panel = ({userType, userId, fetchPost}) => {
  const [chosenPanel, setChosenPanel] = useState(null);

  return (
    <div>
      {/* Nagłówek strony - nazwa panelu */}
      {userType === 'client' && (
        <h1>Panel klienta</h1>
      )}
      {userType === 'admin' && (
        <h1>Panel administratora</h1>
      )}
      {userType === 'Employee' && (
        <h1>Panel pracownika</h1>
      )}

      {/* Dodatkowy napis */}
      <h3>Wybierz operację: </h3>

      {/* Select - wybór operacji */}
      {userType === 'client' && (
        <select className="w-100 text-center font-size-24">
          <option value="Choose-option" onClick={() => setChosenPanel('Nothing')}>Choose option</option>
          <option value="Order-pizza" onClick={() => setChosenPanel('OrderPizza')}>Order pizza</option>
          <option value="My-Orders" onClick={() => setChosenPanel('MyOrders')}>My orders</option>
        </select>
      )}
      {userType === 'admin' && (
        <select className="w-100 text-center font-size-24">
          <option value="Choose-option" onClick={() => setChosenPanel('Nothing')}>Choose option</option>
          <option value="Add-pizza" onClick={() => setChosenPanel('AddPizza')}>Add pizza</option>
          <option value="Show-pizzas" onClick={() => setChosenPanel('ShowPizzas')}>Show pizzas</option>
          <option value="Add-ingredient" onClick={() => setChosenPanel('AddIngredient')}>Add ingredient</option>
          <option value="Show-most-beneficial-pizzas" onClick={() => setChosenPanel('MostBeneficialPizzas')}>Most beneficial pizzas</option>
        </select>
      )}
      {userType === 'Employee' && (
        <select className="w-100 text-center font-size-24">
          <option value="Choose-option" onClick={() => setChosenPanel('Nothing')}>Choose option</option>
          <option value="Update-ingredients-status" onClick={() => setChosenPanel('UpdateIngredientsStatus')}>Change
            ingredients status
          </option>
        </select>
      )}

      {/* Dodatkowy tekst */}
      <h3>Formularz/dane operacji: </h3>

      {userType === 'client' && chosenPanel === 'OrderPizza' && (
        <OrderPizza key={1} fetchPost = {fetchPost} userId={userId} />
      )}
      {userType === 'client' && chosenPanel === 'MyOrders' && (
        <MyOrders key={1} fetchPost = {fetchPost} userId={userId} />
      )}
      {userType === 'admin' && chosenPanel === 'AddPizza' && (
        <AddPizza key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'admin' && chosenPanel === 'ShowPizzas' && (
        <ShowPizzas key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'admin' && chosenPanel === 'AddIngredient' && (
        <AddIngredient key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'admin' && chosenPanel === 'MostBeneficialPizzas' && (
        <MostBeneficialPizzas key={1} fetchPost = {fetchPost} />
      )}
      {userType === 'Employee' && chosenPanel === 'UpdateIngredientsStatus' && (
        <UpdateIngredientsStatus key={1} fetchPost = {fetchPost} />
      )}
    </div>
  );
};

export default Panel;
