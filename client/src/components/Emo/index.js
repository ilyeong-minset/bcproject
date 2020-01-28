import React from 'react';

export default function Emo(props) {
  return(
      <span
      className="emoji"
      role="img"
      aria-label={props.l ? props.l : ""}
  >
      {props.ji}
  </span>);
}
