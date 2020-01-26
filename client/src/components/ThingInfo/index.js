import React, { useState, useEffect, useCallback } from "react";
import {useWeb3Injected} from '@openzeppelin/network/lib/react';
import { ListGroup, Badge } from "react-bootstrap"; 
import { useParams } from "react-router-dom";
import EthAddress from "@bit/lil.baseth.eth-address";

function ThingInfo({ jsonInterface }) {

  let { tokenId } = useParams();

  const [contractInstance, setContractInstance] = useState(undefined);
  const [metadata, setMetadata] = useState(undefined);
  const [account, setAccount] = useState(undefined);

  const w3c = useWeb3Injected();

  useEffect(() => {
    //console.log("w3c.networkId", w3c.networkId);
    //console.log("jsonInterface", jsonInterface);
    loadContract(w3c, jsonInterface, w3c.networkId);
    //console.log(w3c, w3c);
    //console.log("we're fetching that contract", contractInstance);
  }, [jsonInterface, w3c.networkId]);

  async function loadContract(w3c, jsonInterface, networkId) {
    //if (jsonInterface && jsonInterface.networks && Object.keys(jsonInterface.networks).length !== 0) {
    if (jsonInterface && jsonInterface.networks && jsonInterface.networks[networkId]) {
      const address = jsonInterface.networks[networkId].address;

      if (networkId === w3c.networkId) {
        setContractInstance(new w3c.lib.eth.Contract(jsonInterface.abi, address));
        //console.log("new w3c.lib.eth.Contract(jsonInterface.abi, address)", new w3c.lib.eth.Contract(jsonInterface.abi, address));
      }
    }
  }

  useEffect(() => {
    const fetchMetadata = async () => {
      // FIXME handle error if token does not exist
      setMetadata(await contractInstance.methods.getTokenMetadata(parseInt(tokenId)).call());
    };
    
    if (w3c && w3c.accounts && w3c.accounts[0]) {
      fetchMetadata();
    }
  
  }, [w3c.accounts, contractInstance, tokenId]);

  
  useEffect(() => {
    setAccount(w3c.accounts[0]);
  }, [w3c.accounts]);

  /*useEffect(() => {
    console.log("metadata",metadata);
  }, [metadata]);*/

  // TODO I have to understand better useCallback
  const actionBorrow = useCallback(() => {
    //console.log("account", account);
    contractInstance.methods.borrow(parseInt(tokenId)).send({from: w3c.accounts[0]});
  }, [contractInstance]);

  if(metadata) {
    return (
      <ListGroup>
  <ListGroup.Item>{metadata.name} <Badge variant="info">{metadata.id}</Badge></ListGroup.Item>
        <ListGroup.Item>Owner: {(account === metadata.owner) ? 'You' : <EthAddress v={metadata.owner} />}</ListGroup.Item>
        <ListGroup.Item>Bearer: {(account === metadata.bearer) ? 'You' : <EthAddress v={metadata.bearer} />}</ListGroup.Item>
        <ListGroup.Item>Deposit required: {metadata.deposit}</ListGroup.Item>
        {(account === metadata.bearer) ? '' : <ListGroup.Item action onClick={actionBorrow}>Borrow</ListGroup.Item>}
        <ListGroup.Item><img src={"https://gateway.pinata.cloud/ipfs/"+metadata.picture} alt="The object" /></ListGroup.Item>
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