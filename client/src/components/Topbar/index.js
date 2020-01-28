import React from 'react';
import {useWeb3Injected} from '@openzeppelin/network/lib/react';
import { Navbar, Nav, Badge } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import Blockie from '../Blockie/index.js';
import Emo from '../Emo/index.js';

import defaultlogo from './default.svg';
import metamasklogo from './metamask.svg';

const IconWeb3 = ({ w3c }) => (
    <Nav.Link href="/web3">
        {window.ethereum ? '' : <Badge variant="danger">No Web3</Badge>}
    </Nav.Link>
);

const IconWallet = ({ w3c }) => (
    <img
        alt="Metamask"
        src={metamasklogo}
        width="30"
        height="30"
        className="d-inline-block align-top"
    />
);

const IconNetwork = ({ w3c }) => (
    <Navbar.Text style={{fontSize: 26}}>
      {netico(w3c.networkId)}
    </Navbar.Text>
);

function netico(networkId) {
    switch (networkId) {
        case 1:
          return <Emo ji="🟢" l="Mainnet" />;
        case 3: //ropsten
          return <Emo ji="🟠" l="opsten" />; //pink
        case 4: //rinkeby
          return <Emo ji="🟡" l="Rinkeby" />; // yellow
        case 5: //goerli
          return <Emo ji="🔵" l="Goerli" />; //light blue
        case 42: //kovan
          return <Emo ji="🟣" l="Kovan" />; //blue or purple
        default:  //private?
          return <Emo ji="⬜" l="Other" />;
      }
} 

const IconAccount = ({ w3c }) => (
    <Navbar.Text>
        {(w3c && w3c.accounts)
            ? (<Blockie address={w3c.accounts[0]} />)
            : ('no account')}
    </Navbar.Text>
);



export default function Topbar({ brandLogo, brandName }) {
    const location = useLocation();
    const w3c = useWeb3Injected();

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="/">
                    <img
                        alt="Logo"
                        src={(brandLogo) ? brandLogo : defaultlogo}
                        width="32"
                        height="32"
                        className="d-inline-block align-top"
                    />{' '}
                    {(brandName) ? brandName : '(App Name)'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Navbar.Text className="mr-auto">
                        {(location.pathname === '/')
                            ? 'Home'
                            : <Badge variant="primary">{location.pathname}</Badge>}
                    </Navbar.Text>
                    
                    <IconWeb3 w3c={w3c} />
                    <IconWallet w3c={w3c} />
                    <IconNetwork w3c={w3c} />
                    <IconAccount w3c={w3c} />
                </Navbar.Collapse>
            </Navbar>
        </>
    );
}