import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  addDays,
  subDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  isSameDay,
} from "date-fns";
import EventCard from "./EventCard";
import Edit from "../assets/edit.png";
import Delete from "../assets/delete.png";
import Meet from "../assets/meet.png";

// Styled Components
const CalendarWrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.viewMode === "Month" ? "repeat(7, 1fr)" : props.viewMode === "Day" ? "80px 1fr" : "80px repeat(7, 1fr)"};
  grid-auto-rows: ${(props) => (props.viewMode === "Month" ? "100px" : "60px")};
  font-family: Arial, sans-serif;

  @media (max-width: 768px) {
    grid-template-columns: ${(props) =>
      props.viewMode === "Month" ? "repeat(3, 1fr)" : "1fr"};
    font-size: 0.8rem;
  }
`;

const Header = styled.div`
  grid-column: span 8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
  font-size: 18px;
  font-weight: bold;
`;

const NavigationContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const NavigationButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 2px solid #c9ddef;
  border-radius: 20%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f0f0f0;
  }

  i {
    font-size: 20px;
    color: #007bff;
  }
`;

const ViewButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  background-color: transparent;
  color: #000;
  font-weight: 400;
  font-size: 0.9rem;
  outline: none;

  ${({ isActive }) =>
    isActive &&
    `
    border-bottom: 3px solid #007bff;
  `}

  &:hover {
    color: #0056b3;
  }
`;

const DayHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  font-weight: 400;
  font-size: 0.9rem;
`;

const TimeSlot = styled.div`
  border: 1px solid #efefef;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.isTimeColumn ? "flex-start" : "center")};
  padding-left: ${(props) => (props.isTimeColumn ? "10px" : "0")};
  background-color: ${(props) => (props.isTimeColumn ? "#f9f9f9" : "white")};
  height: 60px;
`;

const TimeLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #2586e0;
  margin-right: 5px;
`;

const EventContainer = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;



const Popover = styled.div`
  position: absolute;
  top: ${(props) => props.position.top}px;
  left: ${(props) => props.position.left}px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  padding: 15px;
  border-radius: 8px;
  z-index: 1000;
  width: 250px;
  border: 1px solid #e0e0e0;

  h4 {
    font-size: 16px;
    margin-bottom: 10px;
    color: #333;
  }

  p {
    font-size: 14px;
    margin: 5px 0;
    color: #555;
  }

  .popover-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .edit-btn,
  .delete-btn {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    color: #007bff;
    text-decoration: underline;
  }

  .delete-btn {
    color: #ff4d4d;
  }
`;

// Modal Component
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div.attrs(() => ({ className: "modal-content" }))`
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -12px;
  right: -15px;
  background: rgb(0, 109, 191);
  border: none;
  border-radius: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  width:7%;
  color: #fff;
`;

const DateCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px;
  border: 1px solid #efefef;
  background-color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
  }

  .date-number {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .event {
    background-color: #007bff;
    color: white;
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 0.7rem;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  .show-more {
    font-size: 0.7rem;
    color: #007bff;
    cursor: pointer;
    margin-top: 2px;
  }
`;

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

// Main Calendar Component
const Calendar = () => {
  const [startDate, setStartDate] = useState(new Date(2024, 7, 29));
  const [viewMode, setViewMode] = useState("Day");
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingData,setMeetigData] = useState([]);

  useEffect(() => {
    fetch("/calendarfromtoenddate.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch events");
        return response.json();
      })
      .then((data) => setAllEvents(data))
      .catch((error) => alert("Unable to load events. Please try again later."));
  }, []);

  const days = useMemo(() => {
    if (viewMode === "Week") {
      const startOfCurrentWeek = startOfWeek(startDate, { weekStartsOn: 0 });
      return Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(startOfCurrentWeek, i);
        return {
          name: format(date, "EEEE"),
          date: format(date, "dd MMM"),
          fullDate: format(date, "yyyy-MM-dd"),
        };
      });
    } else if (viewMode === "Day") {
      return [
        {
          name: format(startDate, "EEEE"),
          date: format(startDate, "dd MMM"),
          fullDate: format(startDate, "yyyy-MM-dd"),
        },
      ];
    } else if (viewMode === "Month") {
      return eachDayOfInterval({
        start: startOfMonth(startDate),
        end: endOfMonth(startDate),
      }).map((date) => ({
        name: format(date, "EEEE"),
        date: format(date, "dd MMM"),
        fullDate: format(date, "yyyy-MM-dd"),
      }));
    }
    return [];
  }, [viewMode, startDate]);

  const hours = useMemo(
    () => [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
    ],
    []
  );

  const handlePrevious = () => {
    setStartDate((prev) =>
      viewMode === "Week"
        ? subDays(prev, 7)
        : viewMode === "Day"
        ? subDays(prev, 1)
        : subDays(prev, 30)
    );
  };

  const handleNext = () => {
    setStartDate((prev) =>
      viewMode === "Week"
        ? addDays(prev, 7)
        : viewMode === "Day"
        ? addDays(prev, 1)
        : addDays(prev, 30)
    );
  };

  const isTimeInRange = (time, start, end) => {
    const timeSlotStart = parseISO(
      `${format(parseISO(start), "yyyy-MM-dd")}T${time}:00`
    );
    const timeSlotEnd = new Date(timeSlotStart.getTime() + 60 * 60 * 1000);
    const eventStart = parseISO(start);
    const eventEnd = parseISO(end);

    return (
      (timeSlotStart >= eventStart && timeSlotStart < eventEnd) ||
      (timeSlotEnd > eventStart && timeSlotEnd <= eventEnd) ||
      (timeSlotStart <= eventStart && timeSlotEnd >= eventEnd)
    );
  };

  const handleEventClick = (clickedEvent, e) => {
    const rect = e.target.getBoundingClientRect();
    const overlappingEvents = allEvents.filter(
      (event) =>
        event.start === clickedEvent.start && event.end === clickedEvent.end
    );
  
    if (overlappingEvents.length === 1) {
      // Open modal directly for a single event
      setSelectedEvent(null); // Ensure popover is closed
      setIsModalOpen(true);
      setMeetigData(overlappingEvents[0]);
    } else {
      // Display popover for multiple events
      setSelectedEvent({
        events: overlappingEvents,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + rect.width + 10,
        },
      });
    }
  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectedEvent &&
        !event.target.closest(".popover") && !event.target.closest(".modal-content")
      ) {
        setSelectedEvent(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEvent]);

  const handleMeeting=(events)=>{
    setIsModalOpen(true);
    console.log('dataEvent',events);
    setMeetigData(events)
  }
  return (
    <>
      <Header>
        <NavigationContainer>
          <NavigationButton onClick={handlePrevious}>
            <i className="fa fa-angle-left" aria-hidden="true"></i>
          </NavigationButton>
          <NavigationButton onClick={handleNext}>
            <i className="fa fa-angle-right" aria-hidden="true"></i>
          </NavigationButton>
        </NavigationContainer>
        {viewMode === "Month" ? (
    <span>{format(startDate, "MMMM yyyy")}</span>
  ) : viewMode === "Day"?(<span>{format(startDate, "MMMM yyyy")}</span>):(
    <span>{`${format(
      startOfWeek(startDate, { weekStartsOn: 0 }),
      "dd MMM"
    )} to ${format(
      addDays(startOfWeek(startDate, { weekStartsOn: 0 }), 6),
      "dd MMM"
    )}`}</span>
  )}
        <ViewButtonGroup>
          {["Day", "Week", "Month"].map((view) => (
            <ViewButton
              key={view}
              onClick={() => setViewMode(view)}
              isActive={viewMode === view}
            >
              {view}
            </ViewButton>
          ))}
        </ViewButtonGroup>
      </Header>
      <CalendarWrapper viewMode={viewMode}>
        {viewMode === "Month" &&
          days.map((day, index) => {
            const eventsForDay = allEvents.filter((event) =>
              isSameDay(parseISO(event.start), parseISO(day.fullDate))
            );

            return (
              <DateCell key={index}>
                <div className="date-number">
                  {parseInt(day.fullDate.split("-")[2], 10)}
                </div>
                {eventsForDay.slice(0, 3).map((event, eventIndex) => (
                  <EventCard
                    key={eventIndex}
                    title={event.user_det.job_id.jobRequest_Title}
                    interviewer={event.user_det.handled_by.firstName}
                    time={`${format(parseISO(event.start), "HH:mm")} - ${format(
                      parseISO(event.end),
                      "HH:mm"
                    )}`}
                    highlight={eventsForDay.length}
                    viewMode="Month"
                  />
                ))}
              </DateCell>
            );
          })}
        {viewMode !== "Month" && (
          <>
            <TimeSlot isTimeColumn>
              <TimeLabel></TimeLabel>
            </TimeSlot>
            {days.map((day) => (
              <DayHeader key={day.fullDate}>
                {day.date} <br />
                {day.name}
              </DayHeader>
            ))}
            {hours.map((hour, hourIndex) => (
              <React.Fragment key={hourIndex}>
                <TimeSlot isTimeColumn>
                  <TimeLabel>{hour}</TimeLabel>
                </TimeSlot>
                {days.map((day) => {
                  const eventsInSlot = allEvents
                    .filter((event) =>
                      isSameDay(parseISO(event.start), parseISO(day.fullDate))
                    )
                    .filter((event) =>
                      isTimeInRange(hour, event.start, event.end)
                    );

                  const firstEvent = eventsInSlot[0];

                  return (
                    <TimeSlot
                      key={`${hourIndex}-${day.fullDate}`}
                      onClick={(e) =>
                        firstEvent && handleEventClick(firstEvent, e)
                      }
                    >
                      {firstEvent && (
                        <EventContainer>
                          <EventCard
                            title={firstEvent.user_det.job_id.jobRequest_Title}
                            interviewer={
                              firstEvent.user_det.handled_by.firstName
                            }
                            time={`${format(
                              parseISO(firstEvent.start),
                              "HH:mm"
                            )} - ${format(parseISO(firstEvent.end), "HH:mm")}`}
                            highlight={eventsInSlot.length}
                            viewMode={viewMode}
                          />
                        </EventContainer>
                      )}
                    </TimeSlot>
                  );
                })}
              </React.Fragment>
            ))}
          </>
        )}
      </CalendarWrapper>
      {selectedEvent &&
        selectedEvent.events.map((event, index) => (
          <Popover
            key={index}
            position={{
              top: selectedEvent.position.top + index * 95, // Adjust spacing
              left: selectedEvent.position.left,
            }}
            className="popover"
            onClick={()=>handleMeeting(event)}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "0.7rem" }}>
                  {event.user_det.job_id.jobRequest_Title}
                </h4>
                <div>
                  <img src={Edit} style={{ width: "0.8rem", paddingLeft: "0.5rem" }} />
                  <img src={Delete} style={{ width: "0.8rem", paddingLeft: "0.5rem" }} />
                </div>
              </div>
              <p style={{ fontSize: "0.7rem" }}>
                {event.summary}&nbsp;&nbsp;|&nbsp;&nbsp;Interviewer:{" "}
                {event.user_det.handled_by.firstName}
              </p>
              <p style={{ fontSize: "0.7rem" }}>
                Date: {format(parseISO(event.start), "dd MMM yyyy")}
                &nbsp;&nbsp;|&nbsp;&nbsp;Time:{" "}
                {format(parseISO(event.start), "HH:mm")} -{" "}
                {format(parseISO(event.end), "HH:mm")}
              </p>
            </div>
          </Popover>
        ))}

<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {meetingData && (
          <div style={{display:'flex',justifyContent:'space-evenly',border:'1px solid grey',padding:'1rem'}}>
            <div>
            <p style={{fontSize:'0.8rem',lineHeight:'30px'}}>Interview With: {meetingData?.user_det?.handled_by?.firstName}</p>
            <p style={{fontSize:'0.8rem',lineHeight:'30px'}}>Position: {meetingData?.user_det?.job_id?.jobRequest_Title}</p>
            <p style={{fontSize:'0.8rem',lineHeight:'30px'}}>Date: {meetingData?.start ? format(parseISO(meetingData.start), 'dd MM yyyy') : 'N/A'}</p>
            <p style={{fontSize:'0.8rem',lineHeight:'30px'}}>
              Time: {meetingData?.start && meetingData?.end
            ? `${format(parseISO(meetingData.start), 'HH:mm')} - ${format(parseISO(meetingData.end), 'HH:mm')}`
            : 'N/A'}
            </p>
            <p style={{fontSize:'0.8rem',lineHeight:'30px'}}>Interview Via: Google Meet</p>
            <button style={{display:'block',width:'10rem',borderRadius:'0.25rem',background:'transparent',color:'rgb(0, 109, 191)',border:'1px solid rgb(0, 109, 191)',height:"1.5rem"}}>Resume.docx</button>
            <button style={{display:'block',width:'10rem',borderRadius:'0.25rem',background:'transparent',color:'rgb(0, 109, 191)',border:'1px solid rgb(0, 109, 191)',height:"1.5rem",marginTop:'0.25rem'}}>AadharCard</button>
            </div>
            <div>
              <img src={Meet} alt="meet" style={{width:"7.5rem"}}/>
              <a style={{display: 'block',
              marginLeft: '1rem',
              background: 'rgb(0, 109, 191)',
              color: 'rgb(255, 255, 255)',
              padding: '0.5rem 0rem',
              border: 'none',
              borderRadius: '0.25rem',
              width: '4rem',
              textAlign: 'center',
              cursor:'pointer',textDecoration:'none'}} href={meetingData.link} target="_blank">JOIN</a>
            </div>
          </div>
         )}
      </Modal>
    </>
  );
};

export default Calendar;
