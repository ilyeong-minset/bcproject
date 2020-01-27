import React, { Component } from 'react';
import { Connect } from 'uport-connect';
import Web3 from 'web3';
import { ListGroup, Alert } from "react-bootstrap";

const connect = new Connect('Things', { network: 'rinkeby' })
const provider = connect.getProvider()
const web3 = new Web3(provider)

class UportInfo extends Component {
  constructor(props) {
    super(props)

    const { did, address, keypair } = connect

    this.state = {
      ethAddress: address,
      uportId: did,
      appId: keypair.did
    }

    this.logout = this.logout.bind(this)
    //this.sendEther = this.sendEther.bind(this)
    //this.setStatus = this.setStatus.bind(this)
    this.updateField = this.updateField.bind(this)
    this.connectUport = this.connectUport.bind(this)
    this.getChainState = this.getChainState.bind(this)
  }

  updateField(event) {
    let { name, value } = event.target
    this.setState({ [name]: value })
  }

  connectUport() {
    web3.eth.getCoinbase((err, address) => {
      if (err) { throw err }
      this.setState({ ethAddress: address, uportId: connect.did, appId: connect.keypair.did })
      this.getChainState()
    })
  }

  getChainState() {
    const { ethAddress } = this.state

    web3.eth.getBalance(ethAddress, (err, balance) => {
      this.setState({ ethBalance: web3.utils.fromWei(balance) })
    })

  }

  /*
  sendEther() {
    const { amount, sendTo, ethAddress } = this.state
    web3.eth.sendTransaction({to: sendTo, value: amount, from: ethAddress}, (err, ethTxHash) => {
      if (err) { throw err }
      this.setState({ethTxHash})
    })
  }*/


  logout() {
    connect.logout()
    provider.address = null
    this.setState({ ethAddress: null, uportId: null })
  }

  render() {
    const { uportId, ethAddress, appId } = this.state

    return (
      <>
        <Alert key="network2-alert" variant="danger">Ignore previous global message, for this one to work you have to set Metamask on Rinkeby</Alert>
        <Alert key="uport-alert" variant="danger">uPort is kind of slow, sometime you have to click several time or wait (same on their own web apps & mobile)</Alert>
        <ListGroup>
          <ListGroup.Item active action onClick={this.connectUport}>Click to connect uPort</ListGroup.Item>
          <ListGroup.Item>DID App Id: <code>{appId}</code></ListGroup.Item>
          <ListGroup.Item>DID uPort Id: <code>{uportId}</code></ListGroup.Item>
          <ListGroup.Item>Address: <code>{ethAddress}</code></ListGroup.Item>
          <ListGroup.Item active action onClick={this.logout}>Click to log out uPort</ListGroup.Item>
        </ListGroup>
      </>
    );
  }
}

export default UportInfo;