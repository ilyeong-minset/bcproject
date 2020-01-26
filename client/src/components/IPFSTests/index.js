import React, { useState, useEffect } from "react";
import { ListGroup, Alert } from "react-bootstrap";
import ipfsClient from "ipfs-http-client";

function IPFSTests({ jsonInterface }) {


  const ipfs = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https"
  });

  const CID = 'QmUHXsdbPKKmjKHsBnyvDaX44Pb5soK8Ri3Jb7udMLJuMz'

  const [data, setData] = useState(undefined);
  const [json, setJson] = useState(undefined);
  const [name, setName] = useState(undefined);
  const [description, setDescription] = useState(undefined);
  const [image, setImage] = useState(undefined);


  useEffect(() => {

    const fetchData = async () => {
      const result = await ipfs.get(CID);
      setData(result[0]);
    };
    fetchData();

    /*
      const validCID = 'QmUHXsdbPKKmjKHsBnyvDaX44Pb5soK8Ri3Jb7udMLJuMz'
    
      ipfs.get(validCID, function (err, files) {
       
      console.log("err",err);
      console.log("files",files);
      
      files.forEach((file) => {
          console.log(file.path)
          console.log(file.content.toString('utf8'))
        })
      })
    */

  }, []); // empty array because we only run once


  useEffect(() => {
    if(data && data.content) {
      const json = JSON.parse(data.content.toString('utf8'));
      setJson(json);
      setName(json.name);
      setDescription(json.description);
      setImage(json.image)
    }
  }, [data]);


  if (json) {
    return (
      <>
        <ListGroup>
        <ListGroup.Item>{json.name}</ListGroup.Item>
        <ListGroup.Item>{json.description}</ListGroup.Item>
        <ListGroup.Item>{json.image}</ListGroup.Item>
        </ListGroup>
      </>
    );
  } else {
    return (
      <>
        <Alert key="loading" variant="secondary">Loading...</Alert>
      </>
    );
  }
}

export default IPFSTests;