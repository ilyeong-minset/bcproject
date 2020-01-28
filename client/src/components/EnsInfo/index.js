import React, { useState, useEffect } from "react";
import { ListGroup, Alert } from "react-bootstrap";
import { useWeb3Injected } from '@openzeppelin/network/lib/react';

function EnsInfo({ jsonInterface }) {

  const [resultAddress, setResultAddress]= useState(undefined);
  //const [resultName, setResultName]= useState(undefined);

  const w3c = useWeb3Injected();

  const name = "admin.app.etherbase.eth";
  //const address = "0x4f37819c377F868Fd37c4b62cef732f6cAd4DB6B";

  useEffect(() => {
    const resolveEns = async () => {
      setResultAddress(await w3c.lib.eth.ens.getAddress(name));
    };
    /*const resolveReverseEns = async () => {
      //not yet supported by web3.js https://github.com/ethereum/web3.js/issues/2683
    };*/
    resolveEns()
    //resolveReverseEns()
  }, [w3c.networkId]); 

  if (resultAddress) {
    return (
      <>
        <Alert key="network3-alert" variant="danger">Ignore previous global message, for this one to work you have to set Metamask on Mainnet (where ENS is)</Alert>
        <ListGroup>
          <ListGroup.Item><b>{name}</b> resolves to <code>{resultAddress}</code> on ENS (queried with web3.js)</ListGroup.Item>
        </ListGroup>
      </>
    );
  } else {
    return (
      <>
        <Alert key="network4-alert" variant="danger">Ignore previous global message, for this one to work you have to set Metamask on Mainnet (where ENS is)</Alert>
        <Alert key="loading" variant="secondary">Loading... are you on Mainnet?</Alert>
      </>
    );
  }
}

export default EnsInfo;