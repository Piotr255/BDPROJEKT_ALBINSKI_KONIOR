import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from "react";
import Panel from "./Panel";
import {Button, Form} from "react-bootstrap";

function App() {

  const [panelsCount, setPanelsCount] = useState(0);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [userType, setUserType] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [changedAccount, setChangedAccount] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [phone, setPhone] = useState('');

  //const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setCity('');
    setStreet('');
  }, [showRegForm, showLogForm]);

  const fetchPost = async (url, body) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        return data
      }
      return {data, error: null}
    } catch (error) {
      return {data: null, error: error.message};
    }
  }

  const fetchGet = async (url, token) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return data
      }
      return {data, error: null}
    } catch (error) {
      return {data: null, error: error.message};
    }
  }

  function createPanels(numberOfPanels) {
    const panels = [];
    for (let i = 0; i < numberOfPanels; i++) {
      panels.push(<Panel key={i} userType={userType} userId={userId} fetchPost={fetchPost}/>);
      panels.push(<hr/>)
    }
    return panels;
  }



  async function register(event, role) {
    event.preventDefault();
    console.log("email:", email);
    const res = await fetchPost("http://localhost:9000/user/register", {
      name: name,
      email: email,
      password: password,
      role: role,
      phone: phone,
      city: city,
      street: street
    });
    console.log(res);
  }
  /*async function register(event) {
    event.preventDefault();
    const res = await fetchPost("http://localhost:9000/account/register", {
      name: name,
      email: email,
      password: password,
      phone: phone,
      address: {
        city: city,
        street: street
      }
    });
    if (!res.error) {
      setRegistered(true);
    } else {
      setError("Istnieje już konto założone na ten email");
    }

  }*/

  async function login(event) {
    event.preventDefault();
    const res = await fetchPost("http://localhost:9000/user/login", {
      email: email,
      password: password
    });

    if(!res || !res.data || !res.data.accessToken){
      console.log(res);
      setError(res.message);
      return;
    }
    const res2 = await fetchGet("http://localhost:9000/user/current", res.data.accessToken);
    console.log(res2);
    setUserType(res2.data.role);
    setUsername(res2.data.name);
    setUserId(res2.data.id);

  }


  useEffect(() => {
    if (loggedIn && changedAccount) {
      setPanelsCount(0);
      setPromptVisible(true);
      setChangedAccount(false);
    }
  }, [loggedIn, changedAccount]);

  const handlePrompt = () => {
    let panel_count = window.prompt("Ile paneli wyświetlić?", '3');
    if (panel_count) {
      setPanelsCount(Number(panel_count));
    }
    setPromptVisible(false);  // Ukrycie prompt po pobraniu danych
  };

  return (
    <div className="container bg-secondary text-white py-1">
      {username ? <p>Zalogowano jako: {username}</p> : <p>Nie zalogowano</p>}
      <Button variant="primary" className="m-3" onClick={() => {
        setShowLogForm(true);
        setShowRegForm(false);
        setRegistered(false);
      }}>Zaloguj się</Button>
      <Button variant="primary" className="m-3" onClick={() => {
        setShowRegForm(true);
        setShowLogForm(false);
        setRegistered(false);
      }}>Zarejestruj się</Button>
      <Button variant="primary" className="m-3" onClick={() => {
        setShowRegForm(false);
        setShowLogForm(false);
      }}>Ukryj</Button>
      <Button onClick={handlePrompt} className="m-3">Ustaw ilość paneli</Button>


      {error && <p>{error}</p>}
      {showRegForm && (
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Imię</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setName(event.target.value);
              setRegistered(false); // Żeby zniknął komunikat o byciu zarejestrowanym
            }}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setEmail(event.target.value);
              setRegistered(false);
            }}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Hasło</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setPassword(event.target.value);
              setRegistered(false);
            }}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Miasto</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setCity(event.target.value);
              setRegistered(false);
            }}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Adres dostaw(ulica i numer domu, mieszkania)</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setStreet(event.target.value);
              setRegistered(false);
            }}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Kontaktowy numer telefonu</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setPhone(event.target.value);
              setRegistered(false);
            }}/>
          </Form.Group>
          <Button variant="success" onClick={(event) => register(event,"client")}>Submit</Button>
        </Form>
      )}


      {showLogForm && (
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setEmail(event.target.value);
            }}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Hasło</Form.Label>
            <Form.Control type="text" onInput={(event) => {
              setPassword(event.target.value);
            }}/>
          </Form.Group>
          <Button variant="success" onClick={login}>Submit</Button>
        </Form>
      )}


      {registered && <p>Zarejestrowano. Można się zalogować.</p>}
      {panelsCount > 0 && createPanels(panelsCount)}
    </div>
  );
}

export default App;
