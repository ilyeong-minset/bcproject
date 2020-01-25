import React, { useState, useEffect } from "react";
import {useWeb3Injected} from '@openzeppelin/network/lib/react';
import { ListGroup, Alert } from "react-bootstrap"; 

function Deposit({ jsonInterface }) {

  const [contractInstance, setContractInstance] = useState(undefined);
  const [balances, setBalances] = useState(undefined);


  const w3c = useWeb3Injected();

  useEffect(() => {
    //console.log("w3c.networkId", w3c.networkId);
    //console.log("jsonInterface", jsonInterface);
    loadContract(w3c, jsonInterface, w3c.networkId);
  }, [jsonInterface, w3c.networkId]);

  async function loadContract(w3c, jsonInterface, networkId) {
    if (jsonInterface && jsonInterface.networks && jsonInterface.networks[networkId]) {
      const address = jsonInterface.networks[networkId].address;

      if (networkId === w3c.networkId) {
        setContractInstance(new w3c.lib.eth.Contract(jsonInterface.abi, address));
        //console.log("new w3c.lib.eth.Contract(jsonInterface.abi, address)", new w3c.lib.eth.Contract(jsonInterface.abi, address));
      }
    }
  }

  useEffect(() => {
    const fetchDeposits = async () => {
      //console.log("calling from w3c.accounts[0]", w3c.accounts[0]);      
      setBalances(await contractInstance.methods.getDepositBalances().call({from: w3c.accounts[0]}));
      //console.log("tokens", tokens);
    };
    
    if (w3c && w3c.accounts && w3c.accounts[0]) {
      fetchDeposits();
    }
  
  }, [w3c.accounts, contractInstance]);


  if(!balances) {
    return (
      <Alert key="loading" variant="secondary">Loading...</Alert>
    );
  } /*else if()) {
    return (
      <ListGroup>
        <ListGroup.Item>...</ListGroup.Item>
      </ListGroup>
    );
  }*/ else {
    return (
      <ListGroup>
        <ListGroup.Item>Your balance: {balances.balance}</ListGroup.Item>
        <ListGroup.Item>Your required balance: {balances.requiredBalance} (according to the <a href="/things/borrowed">objects you are borrowing</a>)</ListGroup.Item>
      </ListGroup>
    );
  }
}

export default Deposit;