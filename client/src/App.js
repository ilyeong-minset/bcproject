import React, { /*useState, useEffect*/ } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

import Topbar from "@bit/lil.baseth.topbar";
import AppMenu from "@bit/lil.baseth.app-menu";
import Messages from "@bit/lil.baseth.messages";
import Footers from "@bit/lil.baseth.footers";
import Web3Info from "@bit/lil.baseth.web3-info";
import IpfsUpload from "@bit/lil.baseth.ipfs-upload";
//import ContractInfo from "@bit/lil.baseth.contract-info";


//import ContractInfo from "./components/ContractInfo/index.js";
//import Comments from "./components/Comments/index.js";
//import  from '@bit/lil.baseth.';
//import  from '@bit/lil.baseth.';

import ThingsOwned from './components/ThingsOwned/index.js';
import ThingInfo from './components/ThingInfo/index.js';
import Deposit from './components/Deposit/index.js';
import IPFSTests from './components/IPFSTests/index.js';
import EnsInfo from "./components/EnsInfo/index.js";
import UportInfo from "./components/UportInfo/index.js";
//import  from './components//index.js';
//import  from './components//index.js';
//import { EthRpcApi } from "./components/ERC721Utils/index.js";
//import Web3Info from "./components/Web3Info/index.js";
//import MetamaskInfo from "./components/MetamaskInfo/index.js";
//import IpfsUpload from "./components/IpfsUpload/index.js";
//import Footers from "./components/Footers/index.js";

//import Box from "3box";
import { useWeb3Injected } from "@openzeppelin/network/lib/react";
//import logo from './eth-logo.svg';

import "./bootstrap.dark.min.css";

import MyContract from "./contracts-build/Thing.json";
import { Alert } from "react-bootstrap";

function App() {
  //window.ethereum.enable();

  const targetNetworkId = 12345;

  const w3c = useWeb3Injected();

  //////////
  // 3Box //
  //////////

  /*
  const box3Admin = "0x27DECC12dD9A567FedF19C13666144DA649Ce96b";
  //const box = await Box.openBox(box3Admin, window.ethereum);

  const [box3box, setBox3box] = useState();
  const [box3profile, setBox3profile] = useState();

  useEffect(() => {
    //asyncCall().then(setVal);
    if (w3c.accounts && w3c.accounts[0]) {
      Box.openBox(w3c.accounts[0], window.ethereum).then(setBox3box);
      Box.getProfile(w3c.accounts[0]).then(setBox3profile);
    }
  }, [w3c.accounts]);
*/

  const menu = {
    "Web3 Info": "/web3info",
    "Things I own": "/things/owned",
    "Things I have borrowed": "/things/beared",
    "Deposit Management": "/deposit",
    "IPFS Tests": "/ipfstests",
    "ENS Info": "/ensinfo",
    "uPort": "/uport",
    "IPFS Utils (upload)": "/ipfsutils"
    //"Metamask Info": "/metamaskinfo",
    //"Contract Info": "/contractinfo",
    //Blocks: "/blocks",
    //"Transaction Info": "/transacinfo",
    //Events: "/events",
    //"Past events": "/pastevents",
    //"IPFS Upload": "/ipfsupload",
    //Comments: "/comments"
  };

  const footerMessage = (
    <>
      Made with Ethereum
    </>
  );

  return (
    <Router>
      <div className="App">
        <Topbar /*brandLogo={logo}*/ brandName="Bootcamp project" />
        <Messages requiredNetwork={targetNetworkId} />
        <Switch>
          <Route exact path="/">
            <AppMenu menu={menu} />
          </Route>
          <Route path="/web3info" component={Web3Info} />

          {/*<Route path="/contractinfo">
            <ContractInfo
              jsonInterface={MyContract}
              networkId={targetNetworkId}
            />
          </Route>
          <Route path="/metamaskinfo" component={MetamaskInfo} />
          <Route path="/ipfsupload" component={IpfsUpload} />
          <Route path="/comments">
            <Comments
              box={box3box}
              myAddress={window.ethereum.selectedAddress}
              currentUser3BoxProfile={box3profile}
              adminEthAddr={box3Admin}
            />
  </Route>]*/}

          {/* always keep it before  */}
          <Route exact path="/things/owned">
            <ThingsOwned jsonInterface={MyContract} />
          </Route>

          <Route path="/things/:tokenId">
            <ThingInfo jsonInterface={MyContract} />
          </Route>

          <Route path="/deposit">
            <Deposit jsonInterface={MyContract} />
          </Route>


          {/*TODO remove? <Route path="/ipfstests">
            <IPFSTests jsonInterface={MyContract} />
</Route>*/}


          <Route path="/ensinfo">
            <EnsInfo />
          </Route>

          <Route path="/uport">
            <UportInfo />
          </Route>

          <Route path="/ipfsutils" component={IpfsUpload} />

          <Route path="/fund">
            <ListGroup>
              <ListGroup.Item>On a local dev net (ganache), you have a 100 eth on the first addresses</ListGroup.Item>
              <ListGroup.Item>On public testnets, you have to fund you account on faucets (such as <a href="https://faucet.rinkeby.io/">the Rinkeby faucet</a>)</ListGroup.Item>
            </ListGroup>
          </Route>

          {/*<Route path="/things/borrowed" component={MyThings} />
          <Route path="/things/add" component={Thing} />
          
          <Route path="/search" component={Search} />
          <Route path="/web3" component={Web3Info} />
          <Route path="/demo" component={ListDemo} />
          <Route path="/share" component={WebShareTarget} />
          <Route path="*" component={NotFound} />*/}
        </Switch>
        <Footers message={footerMessage} />
        <Alert>Current account: <code>{w3c.accounts[0]}</code></Alert>
      </div>
    </Router>
  );
}

export default App;