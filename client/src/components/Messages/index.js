import React, { useState, useEffect } from "react";
import { useWeb3Injected } from "@openzeppelin/network/lib/react";
import { ListGroup } from "react-bootstrap";
import { GiBattery25 } from 'react-icons/gi';
import { MdSignalCellularConnectedNoInternet1Bar } from 'react-icons/md';
//import EthAddress from '../EthAddress/index';

const MessageWeb3 = () =>
  window.ethereum ? (
    ""
  ) : (
    <ListGroup.Item variant="danger">No Web3</ListGroup.Item>
  );

const MessageWallet = () =>
  window.ethereum && window.ethereum.isMetaMask ? (
    ""
  ) : (
    <ListGroup.Item variant="warning">Wallet is not Metamask</ListGroup.Item>
  );

const MessageNetwork = ({ w3c, requiredNetwork }) =>
  w3c && w3c.networkId !== parseInt(requiredNetwork) ? (
    <ListGroup.Item variant="danger">
      <MdSignalCellularConnectedNoInternet1Bar /> Wrong network {w3c.networkId} ({w3c.networkName}), change it in your
      wallet to {requiredNetwork}
    </ListGroup.Item>
  ) : (
    ""
  );

function MessageBalance({ w3c, requiredBalance }) {
  const [balance, setBalance] = useState();
  const required = requiredBalance ? parseFloat(requiredBalance) : 0.05;

  useEffect(() => {
    const fetchBalance = async () => {
      const x = await w3c.lib.eth.getBalance(w3c.accounts[0]);
      setBalance(w3c.lib.utils.fromWei(x));
    };
    if (w3c && w3c.accounts && w3c.accounts[0]) fetchBalance();
  }, [w3c.accounts, w3c.networkId]);

  //TODO better way? from oz
  //let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]) : web3.utils.toWei('0');
  //balance = web3.utils.fromWei(balance, 'ether');

  return w3c && w3c.accounts && w3c.accounts[0] && balance < required ? (
    <ListGroup.Item variant="warning">
      <GiBattery25 /> Your balance is low ({balance}) (go <a href="/fund">Fund account</a>)
    </ListGroup.Item>
  ) : (
    ""
  );
}

export default function Messages({ requiredNetwork }) {
  const w3c = useWeb3Injected();
  //const [account, setAccount] = useState(); //FIXME create an error
  //const [balance, setBalance] = useState();

  return (
    <ListGroup>
      <MessageWeb3 />
      <MessageWallet />
      <MessageNetwork w3c={w3c} requiredNetwork={requiredNetwork} />
      <MessageBalance w3c={w3c} requiredBalance="0.1" />
    </ListGroup>
  );
}
