import React from "react";
import { ListGroup, Image } from "react-bootstrap";
import ipfsClient from "ipfs-http-client";

class IpfsUpload extends React.Component {
  constructor() {
    super();
    this.state = {
      added_file_hash: null
    };
    this.ipfs = ipfsClient({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https"
    });

    // bind methods
    this.captureFile = this.captureFile.bind(this);
    this.saveToIpfs = this.saveToIpfs.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  captureFile(event) {
    event.stopPropagation();
    event.preventDefault();
    //if (document.getElementById("keepFilename").checked) {
    //  this.saveToIpfsWithFilename(event.target.files);
    //} else {
    this.saveToIpfs(event.target.files);
    //}
  }

  // Example #1
  // Add file to IPFS and return a CID
  saveToIpfs(files) {
    let ipfsId;
    this.ipfs
      .add([...files], { progress: prog => console.log(`received: ${prog}`) })
      .then(response => {
        console.log(response);
        ipfsId = response[0].hash;
        console.log(ipfsId);
        this.setState({ added_file_hash: ipfsId });
      })
      .catch(err => {
        console.error(err);
      });
  }

  // Example #2
  // Add file to IPFS and wrap it in a directory to keep the original filename
  /*  saveToIpfsWithFilename(files) {
    const file = [...files][0];
    let ipfsId;
    const fileDetails = {
      path: file.name,
      content: file
    };
    const options = {
      wrapWithDirectory: true,
      progress: prog => console.log(`received: ${prog}`)
    };
    this.ipfs
      .add(fileDetails, options)
      .then(response => {
        console.log(response);
        // CID of wrapping directory is returned last
        ipfsId = response[response.length - 1].hash;
        console.log(ipfsId);
        this.setState({ added_file_hash: ipfsId });
      })
      .catch(err => {
        console.error(err);
      });
  }
*/

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <ListGroup>
        <ListGroup.Item>
          <form id="captureMedia" onSubmit={this.handleSubmit}>
            <input type="file" onChange={this.captureFile} />
            {/*<br />
          <label htmlFor="keepFilename">
            <input type="checkbox" id="keepFilename" name="keepFilename" /> keep
            filename
          </label>*/}
          </form>
        </ListGroup.Item>
        {this.state.added_file_hash ? (
          <>
            <ListGroup.Item>
              <div>
                Uploaded file hash:
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={"https://ipfs.io/ipfs/" + this.state.added_file_hash}
                >
                  {this.state.added_file_hash}
                </a>
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <Image
                src={"https://ipfs.io/ipfs/" + this.state.added_file_hash}
                height="80rem"
                width="80rem"
              />
            </ListGroup.Item>
          </>
        ) : (
          <ListGroup.Item>No upload</ListGroup.Item>
        )}
      </ListGroup>
    );
  }
}

export default IpfsUpload;
