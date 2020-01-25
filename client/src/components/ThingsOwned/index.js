import React, { useState, useEffect } from "react";
import {useWeb3Injected} from '@openzeppelin/network/lib/react';
import { ListGroup, Alert } from "react-bootstrap"; 

function ThingsOwned({ jsonInterface }) {

  const [contractInstance, setContractInstance] = useState(undefined);
  const [tokens, setTokens] = useState(undefined);


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
    const fetchListOfTokens = async () => {
      //console.log("calling from w3c.accounts[0]", w3c.accounts[0]);      
      setTokens(await contractInstance.methods.getTokensOfOwner().call({from: w3c.accounts[0]}));
      //console.log("tokens", tokens);
    };
    
    if (w3c && w3c.accounts && w3c.accounts[0]) {
      fetchListOfTokens();
    }
  
  }, [w3c.accounts, contractInstance]);


  if(!tokens) {
    return (
      <Alert key="loading" variant="secondary">Loading...</Alert>
    );
  } else if(tokens && (tokens.length > 0)) {
    return (
      <ListGroup>
        <ListGroup.Item>Objects you own:</ListGroup.Item>
        {tokens.map(x => <ListGroup.Item action href={"/things/"+x} key={x}>Object {x}</ListGroup.Item>)}
      </ListGroup>
    );
  } else {
    return (
      <ListGroup>
        <ListGroup.Item>Nothing, you do not own any objects </ListGroup.Item>
      </ListGroup>
    );
  }
}

export default ThingsOwned;