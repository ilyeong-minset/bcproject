import React, { useState, useEffect } from "react";
import { ListGroup } from "react-bootstrap"; 

function ThingsOwned() {



  return (
    <ListGroup>
    <ListGroup.Item action onClick={() => window.ethereum.send('eth_requestAccounts')}>Ethereum Enable (eth_requestAccounts)</ListGroup.Item>
    <ListGroup.Item>Hello</ListGroup.Item>
    </ListGroup>
  );
}

export default ThingsOwned;