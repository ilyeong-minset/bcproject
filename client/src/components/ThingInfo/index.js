import React, { useState, useEffect, useCallback } from "react";
import { useWeb3Injected } from '@openzeppelin/network/lib/react';
import { ListGroup, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import EthAddress from "../EthAddress/index";
import ipfsClient from "ipfs-http-client";
import { FaBeer } from 'react-icons/fa';

function ThingInfo({ jsonInterface }) {

  let { tokenId } = useParams();

  const [contractInstance, setContractInstance] = useState(undefined);
  const [onMD, setOnMD] = useState(undefined);
  const [tokenUri, setTokenUri] = useState(undefined);
  const [offMD, setOffMD] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [change, setChange] = useState(0);
  const [userDepositBalances, setUserDepositBalances] = useState(undefined);
  const [missingDeposit, setMissingDeposit] = useState(undefined);


  const w3c = useWeb3Injected();
  const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https"
  });

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
    const fetchOnMD = async () => {
      // FIXME handle error if token does not exist?
      setOnMD(await contractInstance.methods.getTokenMetadata(parseInt(tokenId)).call());
    };

    //TODO as we now put it in getTokenMetadata this call is not needed anymore
    const fetchTokenUri = async () => {
      // FIXME handle error if token does not exist
      setTokenUri(await contractInstance.methods.tokenURI(parseInt(tokenId)).call());
    };

    const fetchUserDepositBalances = async () => {
      setUserDepositBalances(await contractInstance.methods.getDepositBalances().call({ from: w3c.accounts[0] }));
    };

    if (w3c && w3c.accounts && w3c.accounts[0] && contractInstance) {
      fetchOnMD();
      fetchTokenUri();
      fetchUserDepositBalances(); 
    }

  }, [w3c.accounts, contractInstance, tokenId, change]);

  useEffect(() => {
    if(userDepositBalances && onMD && onMD.deposit) {
      let b = parseInt(userDepositBalances.balance);
      let rb = parseInt(userDepositBalances.requiredBalance);
      let rd = parseInt(onMD.deposit);
      // (350 + 1000) - 650
      setMissingDeposit((rb + rd) - b);
    }
  }, [userDepositBalances, onMD, change]);

  useEffect(() => {

    const fetchData = async () => {
      const result = await ipfs.get(tokenUri);
      if (result[0] && result[0].content) {
        const json = JSON.parse(result[0].content.toString('utf8'));
        setOffMD(json);
      } else {
        console.error("Something wrong with what was retreived on ipfs", result);
      }
    };

    if (tokenUri) fetchData();
  }, [tokenId, tokenUri]); // empty array because we only run once



  useEffect(() => {
    setAccount(w3c.accounts[0]);
  }, [w3c.accounts]);



  const fundMissingDeposit = async (event) => {
    event.preventDefault();
    const tx = await contractInstance.methods.fundDeposit().send({ from: w3c.accounts[0], gasLimit: 500000, value: missingDeposit });

    // trigger an effect x,Y,Z sec later to update values
    setTimeout(() => {
      setChange(change + 1);
    }, 5000);
    setTimeout(() => {
      setChange(change + 1);
    }, 10000);
    setTimeout(() => {
      setChange(change + 1);
    }, 20000);
  };


  // TODO I have to understand better useCallback
  const actionBorrow = useCallback(() => {
    //console.log("account", account);
    contractInstance.methods.borrow(parseInt(tokenId)).send({ from: w3c.accounts[0] });

    // trigger an effect x,Y,Z sec later to update values
    setTimeout(() => {
      setChange(change + 1);
    }, 8000);
    setTimeout(() => {
      setChange(change + 1);
    }, 10000);
    setTimeout(() => {
      setChange(change + 1);
    }, 20000);
  }, [contractInstance]);

  if (onMD && offMD) {
    return (
      <ListGroup>
        <ListGroup.Item><Badge variant="info">{onMD.id}</Badge> {offMD.name}</ListGroup.Item>
        <ListGroup.Item>{offMD.description}</ListGroup.Item>
        <ListGroup.Item>Owner: {(account === onMD.owner) ? 'You' : <EthAddress v={onMD.owner} />}</ListGroup.Item>
        <ListGroup.Item>Bearer: {(account === onMD.bearer) ? 'You' : <EthAddress v={onMD.bearer} />}</ListGroup.Item>
        <ListGroup.Item>Deposit required: {onMD.deposit} Wei</ListGroup.Item>
        {(onMD.lock) ? <ListGroup.Item>Object is locked ! can't do anything</ListGroup.Item> : ''}

        {((account !== onMD.bearer) && (account === onMD.owner) && (!onMD.lock)) 
        ? <ListGroup.Item active action onClick={actionBorrow}>Get it back</ListGroup.Item> 
        : ''}

        {((account !== onMD.bearer) && (missingDeposit <= 0) && (!onMD.lock))
        ? <ListGroup.Item active action onClick={actionBorrow}>Borrow</ListGroup.Item> 
        : ''}

        {((account !== onMD.bearer) && (account !== onMD.owner) && (missingDeposit > 0)) 
        ? <ListGroup.Item active action onClick={fundMissingDeposit}>To borrow this object, your deposit is not enough, fund it ({missingDeposit} Wei)</ListGroup.Item> 
        : ''}

        <ListGroup.Item><img width="200" src={"https://gateway.pinata.cloud/ipfs/" + offMD.image} alt="The object" /></ListGroup.Item>
      </ListGroup>
    );
  } else if (onMD) {
    return (
      <ListGroup>
        <ListGroup.Item>tokenId: {onMD.id}</ListGroup.Item>
        <ListGroup.Item>Owner: {(account === onMD.owner) ? 'You' : <EthAddress v={onMD.owner} />}</ListGroup.Item>
        <ListGroup.Item>Bearer: {(account === onMD.bearer) ? 'You' : <EthAddress v={onMD.bearer} />}</ListGroup.Item>
        <ListGroup.Item>Deposit required: {onMD.deposit}</ListGroup.Item>
        {(account === onMD.bearer) ? '' : <ListGroup.Item action onClick={actionBorrow}>Borrow</ListGroup.Item>}
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
