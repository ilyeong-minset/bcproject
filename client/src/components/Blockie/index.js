import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import ethblockie from 'ethereum-blockies-base64';


const Blockie = props => {
    const address = props.address ? props.address : "0x0";
    const type = props.type ? props.type : '';
    const size = props.size ? props.size : 28;

    return (
        <OverlayTrigger
            trigger="click"
            placement="auto"
            overlay={<Popover id="blockie-popover"><Popover.Content>This blockie represent the {type} address <pre>{address}</pre></Popover.Content>
            </Popover>}>
            <img alt="Blockie" src={ethblockie(address)} width={size} height={size} className="roundedCircle m-1" />
        </OverlayTrigger>
    );
}

export default Blockie;

