import React, {useEffect, useState} from 'react';
import {Badge, ListGroup} from "react-bootstrap";

const MyOrders = ({fetchPost, userId}) => {
  const [clientOrders, setClientOrders] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchPost("http://localhost:9000/client/orders", {
        userId: userId
      });
      if (!res.error) {
        setClientOrders(res.data);
      } else {
        setError(res.error);
      }
    };

    fetchData();
  }, [userId]);
  return (
    <div>
      {error && <p>{error}</p>}
      <ListGroup as="ol" numbered>
        {clientOrders && clientOrders.length > 0 && clientOrders
          .map(order => (
            <ListGroup.Item key={order.customer_order_nr} as="li"
                            className="d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                <div className="fw-bold">Zamówienie nr {order.customer_order_nr}</div>
                <ListGroup as="ul">
                  <ListGroup.Item as="li">
                    {order.status === "0" && (
                      <p>Status: oczekujące</p>
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item as="li">
                    <p>Data i czas zamówienia: {order.order_date}</p>
                  </ListGroup.Item>
                  <ListGroup.Item as="li">
                    <p>Całkowita cena: {order.total_price}</p>
                  </ListGroup.Item>
                  <ListGroup as="ol" numbered>
                    {order.pizzas.map((pizza) => (
                      <ListGroup.Item key={pizza.menu_number} as="li"
                                      className="d-flex justify-content-between align-items-start">
                        <div className="ms-2 me-auto">
                          <div className="fw-bold">{pizza.name}</div>
                          Składniki: {pizza.ingredients.map((item) => item).join(", ")}, Cena: {pizza.price}
                        </div>
                        <Badge bg="primary" pill>
                          {pizza.count}
                        </Badge>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </ListGroup>
              </div>
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  );
};

export default MyOrders;