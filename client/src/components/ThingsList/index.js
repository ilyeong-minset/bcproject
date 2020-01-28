import React, { useState, useEffect } from "react";
import { useWeb3Injected } from '@openzeppelin/network/lib/react';
import { ListGroup, Alert } from "react-bootstrap";
import ipfsClient from "ipfs-http-client";

//function totalSupply()
//function tokenByIndex(uint256 index)
//function tokenURI(uint256 tokenId)

//getTokensOfOwner()
//getTokensOfBearer()

function ThingsList({ jsonInterface, query }) {

  const [contractInstance, setContractInstance] = useState(undefined);
  const [contractAddress, setContractAddress] = useState(undefined);

  const [totalSupply, setTotalSupply] = useState(undefined);
  const [tokenIds, setTokenIds] = useState(undefined);

  const w3c = useWeb3Injected();
  const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https"
  });

  useEffect(() => {
    loadContract(w3c, jsonInterface, w3c.networkId);
  }, [jsonInterface, w3c.networkId]);

  async function loadContract(w3c, jsonInterface, networkId) {
    if (jsonInterface && jsonInterface.networks && jsonInterface.networks[networkId]) {
      const address = jsonInterface.networks[networkId].address;

      if (networkId === w3c.networkId) {
        setContractInstance(new w3c.lib.eth.Contract(jsonInterface.abi, address));
        setContractAddress(address);
      }
    }
  }

  const fetchTotalSupply = async () => {
    let totalSupply = await contractInstance.methods.totalSupply().call({ from: w3c.accounts[0] });
    setTotalSupply(parseInt(totalSupply));
    //console.warn("fetchTotalSupply");
  };

  useEffect(() => {
    if (w3c && w3c.accounts && w3c.accounts[0] && contractInstance) {
      fetchTotalSupply();
    }
  });

  useEffect(() => {
    if (w3c && w3c.accounts && w3c.accounts[0] && contractInstance) {
      fetchTotalSupply();
    }
  }, [contractInstance]);



  useEffect(() => {
    if (totalSupply) {

      const allTokens = Array(totalSupply).fill().map((_, i) => i);
      //console.log(allTokens);

      // pattern taken from https://flaviocopes.com/javascript-async-await-array-map/
      const functionWithPromise = item => { //a function that returns a promise
        return contractInstance.methods.tokenByIndex(item).call({ from: w3c.accounts[0] });
      }
      
      const anAsyncFunction = async item => {
        return functionWithPromise(item);
      }
      
      const fetchAllTokenIds = async () => {
        return (await Promise.all(allTokens.map(item => anAsyncFunction(item)))).map(item => parseInt(item));
      }
      /*
      const fetchOwnerTokenIds = async () => {
        const ownerTokenIds = await contractInstance.methods.getTokensOfOwner().call({ from: w3c.accounts[0] });
        return ownerTokenIds;//.map(item => parseInt(item));
      };

      const fetchBorrowerTokenIds = async () => {
        const borrowerTokenIds = await contractInstance.methods.getTokensOfBorrower().call({ from: w3c.accounts[0] });
        return borrowerTokenIds;//.map(item => parseInt(item));
      };*/

      if (w3c && w3c.accounts && w3c.accounts[0] && contractInstance) {
        if(query === "owned") {
          //setTokenIds(fetchOwnerTokenIds());
          //console.log(fetchOwnerTokenIds().map(item => parseInt(item)));
          contractInstance.methods.getTokensOfOwner().call({ from: w3c.accounts[0] }).then(tokenIds => {
            setTokenIds(tokenIds);
          })
        } else if(query === "borrowed") {
          contractInstance.methods.getTokensOfBearer().call({ from: w3c.accounts[0] }).then(tokenIds => {
            setTokenIds(tokenIds);
          })
        } else {
          fetchAllTokenIds().then(tokenIds => {
            setTokenIds(tokenIds);
          })
        }
      }
      
    }
  }, [totalSupply]);

  if (tokenIds && (tokenIds.length > 0)) {
    return (
      <ListGroup>
        <Alert key="info-contract-address" variant="info">Contract address: {contractAddress}</Alert>
        {tokenIds.map(x => <ListGroup.Item action href={"/things/" + x} key={x}><ThingItem tokenId={x} contractInstance={contractInstance} ipfs={ipfs} /></ListGroup.Item>)}
      </ListGroup>
    );
  } else {
    return (
      <ListGroup>
        <Alert key="info-contract-address" variant="info">Contract address: {contractAddress}</Alert>
        <ListGroup.Item>Nothing / Loading...</ListGroup.Item>
      </ListGroup>
    );
  }

}

function ThingItem({ tokenId, contractInstance, ipfs }) {

  const [tokenUri, setTokenUri] = useState(undefined);
  const [name, setName] = useState(undefined);

  useEffect(() => {
    if (contractInstance) {
      contractInstance.methods.tokenURI(parseInt(tokenId)).call().then(x => setTokenUri(x));
    }
  });

  useEffect(() => {

    const fetchData = async () => {
      const result = await ipfs.get(tokenUri);
      if (result[0] && result[0].content) {
        //TODO can we go directly from result to JSON (for perf)
        //const json = JSON.parse(result[0].content.toString('utf8'));
        const json = JSON.parse(result[0].content);
        setName(json.name);
      } else {
        console.error("Something wrong with what was retreived on ipfs", result);
      }
    };

    if (tokenUri) fetchData();
  }, [tokenUri]); 

  return <>Object {tokenId}: {(name) ? name : 'name loading...'}</>

}



export default ThingsList;