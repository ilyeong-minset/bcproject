import React, { useState, useEffect } from "react";
import {useWeb3Injected} from '@openzeppelin/network/lib/react';
import { ListGroup, Badge } from "react-bootstrap"; 
import EthAddress from "@bit/lil.baseth.eth-address";

function ThingInfo({ jsonInterface }) {

  const [contractInstance, setContractInstance] = useState(undefined);
  const [metadata, setMetadata] = useState(undefined);
  //const [metadata, setMetadata] = useState(undefined);

  const w3c = useWeb3Injected();

  useEffect(() => {
    console.log("w3c.networkId", w3c.networkId);
    console.log("jsonInterface", jsonInterface);
    loadContract(w3c, jsonInterface, w3c.networkId);
    //console.log(w3c, w3c);
    //console.log("we're fetching that contract", contractInstance);
  }, [w3c.networkId]);

  async function loadContract(w3c, jsonInterface, networkId) {
    //if (jsonInterface && jsonInterface.networks && Object.keys(jsonInterface.networks).length !== 0) {
    if (jsonInterface && jsonInterface.networks && jsonInterface.networks[networkId]) {
      const address = jsonInterface.networks[networkId].address;

      if (networkId === w3c.networkId) {
        setContractInstance(new w3c.lib.eth.Contract(jsonInterface.abi, address));
        console.log("new w3c.lib.eth.Contract(jsonInterface.abi, address)", new w3c.lib.eth.Contract(jsonInterface.abi, address));
      }
    }
  }

  useEffect(() => {
    const fetchMetadata = async () => {
      // FIXME handle error if token does not exist
      setMetadata(await contractInstance.methods.getTokenMetadata(1).call());

    };
    
    if (w3c && w3c.accounts && w3c.accounts[0]) fetchMetadata();
  
  }, [w3c.accounts, contractInstance]);

  useEffect(() => {
    console.log("metadata",metadata);
  
  }, [metadata]);

  if(metadata) {
    return (
      <ListGroup>
        <ListGroup.Item>{metadata.name} <Badge variant="info">{metadata.id}</Badge></ListGroup.Item>
        <ListGroup.Item>Owner: <EthAddress v={metadata.owner} /></ListGroup.Item>
        <ListGroup.Item>Bearer: <EthAddress v={metadata.bearer} /></ListGroup.Item>
        <ListGroup.Item><img src="https://gateway.pinata.cloud/ipfs/QmWzq3Kjxo3zSeS3KRxT6supq9k7ZBRcVGGxAkJmpYtMNC" /></ListGroup.Item>
      </ListGroup>
    );
  } else {
    return (
      <ListGroup>
        <ListGroup.Item>Nothing / Loading</ListGroup.Item>
      </ListGroup>
    );
  } 

}

export default ThingInfo;