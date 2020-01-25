import React, { useState, useEffect, useCallback } from "react";
import {useWeb3Injected} from '@openzeppelin/network/lib/react';
import { ListGroup, Alert } from "react-bootstrap"; 

function Deposit({ jsonInterface }) {

  const [contractInstance, setContractInstance] = useState(undefined);
  const [balances, setBalances] = useState(undefined);
  const [withdrawValue, setWithdrawValue] = useState(undefined);
  const [fundValue, setFundValue] = useState(undefined);


  const w3c = useWeb3Injected();

  useEffect(() => {
    //console.log("w3c", w3c);
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


  // should we add? { gas: 50000, gasPrice: 1e6 }  
  // some nice examples https://github.com/status-im/sticker-market/blob/9bcc786d0f20f16ec2239af359edb0c9e0952659/app/components/erc20token.js

  const fundDeposit = async () => {
    setFundValue(contractInstance.methods.fundDeposit().send({from: w3c.accounts[0], value: 1000000}));
  };

  /*  const fundDeposit = async () => {
    const value = await contractInstance.methods.fundDeposit().send({from: w3c.accounts[0], value: 1000000});
    setFundValue(value);
  }; */

  
  //const fundDeposit = (e) => {
    //console.log("contractInstance", contractInstance);
    //e.preventDefault();
    //var who = e.target.value;
    //this._addToLog(ERC20Token.options.address+".methods.balanceOf(" + who + ").call()");
    
    //contractInstance.methods.fundDeposit().send({from: w3c.accounts[0]}).then(_value => setFundValue(_value))
  
    /*var tx = contractInstance.methods.fundDeposit();
    tx.estimateGas().then((r) => {
      tx.send({gas: r, from: w3c.accounts[0]});
    });*/
  //}


  // TODO I have to understand better useCallback
  const withdrawDeposit = useCallback(() => {
    setWithdrawValue(contractInstance.methods.withdrawDeposit().send({from: w3c.accounts[0]}));
  }, [contractInstance]);



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
        <ListGroup.Item action onClick={fundDeposit}>Fund deposit (last funded value: {/*fundValue*/})</ListGroup.Item>
        <ListGroup.Item>Your required balance: {balances.requiredBalance} (according to the <a href="/things/borrowed">objects you are borrowing</a>)</ListGroup.Item>
        <ListGroup.Item action onClick={withdrawDeposit}>Withdraw deposit (last value: {withdrawValue})</ListGroup.Item>      
      </ListGroup>
    );
  }
}

export default Deposit;