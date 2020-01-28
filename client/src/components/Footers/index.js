import React from 'react';
import {ListGroup} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
//import Emo from '../Emo/index.js';


export const Footers = ({noBack, message}) => {
    return (
      <ListGroup>
        {(noBack) ? '' : <GoBack/>}
        <Footer message={message}/>
      </ListGroup>
    );
  }
  
  export const GoBack = () => {
    let history = useHistory(); // do we really need react router here?
  
    return <ListGroup.Item action onClick={history.goBack}>← back</ListGroup.Item>;
  }
  
  export const Footer = ({message}) => {
  return <ListGroup.Item>{(message) ? message : 'Made with Ethereum & BasEth'}</ListGroup.Item>;
  }

  export default Footers;