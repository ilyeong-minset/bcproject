import React /*, { useState, useEffect }*/ from "react";
import {
  Card,
  InputGroup,
  FormControl,
  Button,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";
import { useWeb3Injected } from "@openzeppelin/network/lib/react";

import { Balance } from "../Web3Utils/index";

export default function Web3Info(props) {
  const w3c = useWeb3Injected();

  const { networkId, networkName, accounts, providerName } = w3c;

  return (
    <Card style={{ width: "18rem", margin: "1rem" }}>
      <Card.Header>{props.title}</Card.Header>.
      <Card.Body>
        <InputGroup>
          <FormControl
            id="eth-address"
            value={accounts && accounts.length ? accounts[0] : "Unknown"}
            onChange={() => void 0}
          />
          <InputGroup.Append>
            <Button variant="outline-secondary">Copy</Button>
            {/*<Button variant="outline-secondary">Explore</Button>*/}
          </InputGroup.Append>
        </InputGroup>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroupItem>
          Network:{" "}
          {networkId ? `${networkId} – ${networkName}` : "No connection"}
        </ListGroupItem>
        <ListGroupItem>
          <Balance w3c={w3c} />
        </ListGroupItem>
        <ListGroupItem>Provider: {providerName}</ListGroupItem>
      </ListGroup>
    </Card>
  );
}

