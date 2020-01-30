import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

import Topbar from "./components/Topbar/index.js";
import AppMenu from "./components/AppMenu/index.js";
import Messages from "./components/Messages/index.js";
import IpfsUpload from "./components/IpfsUpload/index.js";
import Footers from "./components/Footers/index.js";
import ThingsList from "./components/ThingsList/index.js";
import ThingInfo from "./components/ThingInfo/index.js";
import Deposit from "./components/Deposit/index.js";
import EnsInfo from "./components/EnsInfo/index.js";
import UportInfo from "./components/UportInfo/index.js";

import { useWeb3Injected } from "@openzeppelin/network/lib/react";
//import logo from './eth-logo.svg';

//import "./bootstrap.simplex.min.css";
import "bootstrap/dist/css/bootstrap.min.css";

import MyContract from "./contracts-build/Thing.json";
import { Alert } from "react-bootstrap";

function App() {
  useEffect(() => {
    window.ethereum.enable();
    console.log("enabling...");
  }, []);

  const targetNetworkId = 12345;

  const w3c = useWeb3Injected();

  const menu = {
    "All the things": "/things/all",
    "Things I own": "/things/owned",
    "Things I borrowed": "/things/borrowed",
    "Deposit Management": "/deposit",
    "ENS Info": "/ensinfo",
    uPort: "/uport",
    "IPFS Utils (upload)": "/ipfsutils"
  };

  const footerMessage = <>Made with Ethereum & IPFS</>;

  return (
    <Router>
      <div className="App">
        <Topbar /*brandLogo={logo}*/ brandName="Bootcamp project" />
        <Messages requiredNetwork={targetNetworkId} />
        <Switch>
          <Route exact path="/">
            <AppMenu menu={menu} />
          </Route>

          {/* always keep it before  */}
          <Route exact path="/things/all">
            <ThingsList jsonInterface={MyContract} query="all" />
          </Route>

          <Route exact path="/things/owned">
            <ThingsList jsonInterface={MyContract} query="owned" />
          </Route>

          <Route exact path="/things/borrowed">
            <ThingsList jsonInterface={MyContract} query="borrowed" />
          </Route>

          <Route path="/things/:tokenId">
            <ThingInfo jsonInterface={MyContract} />
          </Route>

          <Route path="/deposit">
            <Deposit jsonInterface={MyContract} />
          </Route>

          <Route path="/ensinfo">
            <EnsInfo />
          </Route>

          <Route path="/uport">
            <UportInfo />
          </Route>

          <Route path="/ipfsutils" component={IpfsUpload} />

          <Route path="/fund">
            <ListGroup>
              <ListGroup.Item>
                On a local dev net (ganache), you have a 100 eth on the first
                addresses
              </ListGroup.Item>
              <ListGroup.Item>
                On public testnets, you have to fund you account on faucets
                (such as{" "}
                <a href="https://faucet.rinkeby.io/">the Rinkeby faucet</a>)
              </ListGroup.Item>
            </ListGroup>
          </Route>
        </Switch>
        <Footers message={footerMessage} />
        <Alert>
          Current account: {(w3c && w3c.accounts[0]) ? <code>{w3c.accounts[0]}</code> : ''}
        </Alert>
      </div>
    </Router>
  );
}

export default App;
