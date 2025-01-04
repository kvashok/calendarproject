import React from "react";
import styled from "styled-components";

const Card = styled.div`
  position: absolute;
  left: ${(props) =>
    props.viewMode === "Day" ? "40px" : "0px"};
  background: white;
  border: 1px solid #ddd;
  border-left: 20px solid ${(props) => (props.highlight ? "#007BFF" : "#007BFF")};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  font-size: 12px;
  border-radius: 5px;
  z-index:100;
  width:150px;
  height: 3rem;
  cursor: pointer;
`;

const Badge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: ${(props) => (props.highlight ? "#FFD700" : "yellow")};
  color: #000;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EventCard = ({ title, interviewer, time, highlight,viewMode }) => (
  <Card highlight={highlight} viewMode={viewMode}>
    {highlight > 1 && <Badge highlight>{highlight}</Badge>}
    <p style={{lineHeight:'16px'}}><strong>{title}</strong></p>
    <p style={{lineHeight:'16px'}}>Interviewer: {interviewer}</p>
    <p style={{lineHeight:'16px'}}>Time: {time}</p>
  </Card>
);

export default EventCard;
