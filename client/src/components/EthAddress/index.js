import React from 'react';
import { PropTypes } from 'prop-types';
import { Button, Popover, OverlayTrigger } from 'react-bootstrap';
import copy from 'copy-to-clipboard';

const explorerAddUrl = "https://etherscan.io/search?q=";

export default function EthAddress({ v }) {

  const address = v;
  const short = ((window.innerWidth / window.devicePixelRatio) < 750);

  const display =
    (address && short)
      ? [
        ...address.split('').slice(0, 4),
        '...',
        ...address.split('').slice(42 - 2)
      ].join('')
      : address

  return (
    <OverlayTrigger trigger="click" placement="bottom" overlay={popover(address)}>
      <data>{display}</data>
    </OverlayTrigger>);
}

const popover = address => (
  <Popover id={"popover-" + address}>
    <Popover.Content>
      <code>{address}</code> is an Ethereum address<br />
      <a href={explorerAddUrl + address} target="_blank" rel="noopener noreferrer">See it on the block explorer</a><br />
      <Button variant="secondary" size="sm" onClick={() => { copy(address) }}>Copy to clipboard</Button>
    </Popover.Content>
  </Popover>
);

// Hook
/*function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}*/


EthAddress.propTypes = {
  address: PropTypes.string,
  //etherscan: PropTypes.bool,
}