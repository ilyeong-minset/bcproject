import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWeb3Injected } from '@openzeppelin/network/lib/react';
import { ListGroup, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import EthAddress from "../EthAddress/index";
import Blockie from "../Blockie/index";
import ipfsClient from "ipfs-http-client";
import ThreeBoxComments from "3box-comments-react";
import Box from "3box";
import { GiPayMoney, GiDiceSixFacesThree } from 'react-icons/gi';
import { FaRegHandshake, FaHandHolding } from 'react-icons/fa';


function ThingInfo({ jsonInterface }) {

  let { tokenId } = useParams();

  const [contractInstance, setContractInstance] = useState(undefined);
  const [onMD, setOnMD] = useState(undefined);
  const [tokenUri, setTokenUri] = useState(undefined);
  const [offMD, setOffMD] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [userDepositBalances, setUserDepositBalances] = useState(undefined);
  const [missingDeposit, setMissingDeposit] = useState(undefined);

  //3box
  const [comments, setComments] = useState(false);
  const [box, setBox] = useState(undefined);
  const [space, setSpace] = useState(undefined);

  const [delay, setDelay] = useState(10000)
  const [change, setChange] = useState(0);


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
    if(w3c.networkId < 10) {
      setDelay(20000);
    }
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
    if (userDepositBalances && onMD && onMD.deposit) {
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

  //3box
  useEffect(() => {
    if(comments) {
      Box.openBox("0x4f37819c377F868Fd37c4b62cef732f6cAd4DB6B").then(setBox);
    }
  }, [comments]);

  useEffect(() => {
    if(box) {
      box.openSpace("Things").then(setSpace);
    }
  }, [box]);

  const toggle3Box = async (event) => {
    event.preventDefault();
    setComments(!comments);
  };


  const fundMissingDeposit = async (event) => {
    event.preventDefault();
    const tx = await contractInstance.methods.fundDeposit().send({ from: w3c.accounts[0], gasLimit: 500000, value: missingDeposit });

    // trigger an effect x,Y,Z sec later to update values
    setTimeout(() => setChange(Math.random()), delay);
  };


  // TODO I have to understand better useCallback
  const actionBorrow = useCallback(() => {
    //console.log("account", account);
    contractInstance.methods.borrow(parseInt(tokenId)).send({ from: w3c.accounts[0] });

    // trigger an effect x,Y,Z sec later to update values
    setTimeout(() => setChange(Math.random()), delay);


  }, [contractInstance]);

  if (onMD && offMD) {
    return (
      <div>
        <ListGroup>
          <ListGroup.Item><Badge variant="info">{onMD.id}</Badge> {offMD.name}</ListGroup.Item>
          <ListGroup.Item>{offMD.description}</ListGroup.Item>
          <ListGroup.Item>Owner <Blockie address={onMD.owner} /> {(account === onMD.owner) ? 'You' : <EthAddress v={onMD.owner} />}</ListGroup.Item>
          <ListGroup.Item>Bearer <Blockie address={onMD.bearer} /> {(account === onMD.bearer) ? 'You' : <EthAddress v={onMD.bearer} />}</ListGroup.Item>
          <ListGroup.Item>Deposit required: {onMD.deposit} Wei</ListGroup.Item>
          {(onMD.lock) ? <ListGroup.Item>Object is locked ! can't do anything</ListGroup.Item> : ''}

          {((account !== onMD.bearer) && (account === onMD.owner) && (!onMD.lock))
            ? <ListGroup.Item active action onClick={actionBorrow}><FaHandHolding /> Get it back</ListGroup.Item>
            : ''}

          {((account !== onMD.bearer) && (missingDeposit <= 0) && (!onMD.lock))
            ? <ListGroup.Item active action onClick={actionBorrow}><FaRegHandshake /> Borrow</ListGroup.Item>
            : ''}

          {((account !== onMD.bearer) && (account !== onMD.owner) && (missingDeposit > 0))
            ? <ListGroup.Item active action onClick={fundMissingDeposit}><GiPayMoney /> To borrow this object, your deposit is not enough, fund it ({missingDeposit} Wei)</ListGroup.Item>
            : ''}

          <ListGroup.Item><img width="200" src={"https://gateway.pinata.cloud/ipfs/" + offMD.image} alt="The object" /></ListGroup.Item>
          <ListGroup.Item active action onClick={toggle3Box}><GiDiceSixFacesThree /> Toggle 3Box comments (you need a 3Box.io profile to use it)</ListGroup.Item>
        </ListGroup>
        {(comments)
        ? (<ThreeBoxComments
          spaceName="Things"
          threadName={"token-"+tokenId}
          adminEthAddr="0x4f37819c377F868Fd37c4b62cef732f6cAd4DB6B"
          box={box}
          currentUserAddr={window.ethereum.selectedAddress} />)
        : ''}
      </div>
    );
  } else if (onMD) {
    // FIXME this one is too simple... we need to reflect the changes
    return (
      <ListGroup>
        <ListGroup.Item>tokenId: {onMD.id}</ListGroup.Item>
        <ListGroup.Item>Owner <Blockie address={onMD.owner} /> {(account === onMD.owner) ? 'You' : <EthAddress v={onMD.owner} />}</ListGroup.Item>
        <ListGroup.Item>Bearer <Blockie address={onMD.bearer} /> {(account === onMD.bearer) ? 'You' : <EthAddress v={onMD.bearer} />}</ListGroup.Item>
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
