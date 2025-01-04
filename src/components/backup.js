import React, { useState } from "react";
import styled from "styled-components";
import { addDays, subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

const CalendarWrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.viewMode === "Day" ? "1fr" : "80px repeat(7, 1fr)")};
  grid-auto-rows: 60px;
  border: 1px solid #ddd;
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
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

  button {
    padding: 5px 10px;
    border: 2px solid #c9ddef;
    border-radius: 5px;
    cursor: pointer;
    background-color: ${(props) => (props.active ? "#007bff" : "white")};
    color: ${(props) => (props.active ? "white" : "#007bff")};
    font-weight: bold;

    &:hover {
      background-color: #007bff;
      color: white;
    }
  }
`;

const TimeSlot = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.isTimeColumn ? "#f9f9f9" : "white")};
  padding: 10px;
`;

const TimeLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #2586e0;
`;

const EventCardWrapper = styled.div`
  background-color: #eaf4ff;
  padding: 10px;
  margin: 5px 0;
  border-left: 4px solid #007bff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Calendar = () => {
  const [startDate, setStartDate] = useState(new Date(2024, 2, 5)); // Initialize start date
  const [viewMode, setViewMode] = useState("Week"); // Default to Week view

  const allEvents = [
    {
      date: "2024-03-05",
      events: [{ hour: 10, title: "Python Developer", interviewer: "Geetha", duration: "10 - 11 A.M" }],
    },
    {
      date: "2024-03-06",
      events: [{ hour: 10, title: "Python Developer", interviewer: "Geetha", duration: "10 - 11 A.M" }],
    },
    {
      date: "2024-03-09",
      events: [{ hour: 10, title: "Python Developer", interviewer: "Geetha", duration: "10 - 11 A.M" }],
    },
  ];

  const days =
    viewMode === "Week"
      ? eachDayOfInterval({ start: startOfWeek(startDate), end: endOfWeek(startDate) }).map((date) => ({
          name: format(date, "EEEE"),
          date: format(date, "dd MMM"),
          fullDate: format(date, "yyyy-MM-dd"),
        }))
      : [
          {
            name: format(startDate, "EEEE"),
            date: format(startDate, "dd MMM"),
            fullDate: format(startDate, "yyyy-MM-dd"),
          },
        ];

  const hours = ["10 A.M", "11 A.M", "12 P.M", "01 P.M", "02 P.M", "03 P.M", "04 P.M", "05 P.M"];

  const handlePrevious = () => {
    setStartDate((prev) =>
      viewMode === "Week" ? subDays(prev, 7) : subDays(prev, 1)
    );
  };

  const handleNext = () => {
    setStartDate((prev) =>
      viewMode === "Week" ? addDays(prev, 7) : addDays(prev, 1)
    );
  };

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
        <span>
          {viewMode === "Week"
            ? `${format(startOfWeek(startDate), "dd MMM")} to ${format(endOfWeek(startDate), "dd MMM yyyy")}`
            : format(startDate, "dd MMMM yyyy")}
        </span>
        <ViewButtonGroup>
          {["Day", "Week", "Month"].map((view) => (
            <button
              key={view}
              onClick={() => setViewMode(view)}
              active={viewMode === view}
            >
              {view}
            </button>
          ))}
        </ViewButtonGroup>
      </Header>
      <CalendarWrapper viewMode={viewMode}>
        <TimeSlot isTimeColumn></TimeSlot>
        {days.map((day) => (
          <TimeSlot key={day.fullDate}>
            <div>{day.name}</div>
            <div>{day.date}</div>
          </TimeSlot>
        ))}
        {hours.map((hour, hourIndex) => (
          <React.Fragment key={hourIndex}>
            <TimeSlot isTimeColumn>
              <TimeLabel>{hour}</TimeLabel>
            </TimeSlot>
            {days.map((day) => (
              <TimeSlot key={`${hourIndex}-${day.fullDate}`}>
                {allEvents
                  .filter((event) => event.date === day.fullDate)
                  .flatMap((event) => event.events)
                  .filter((e) => e.hour === hourIndex)
                  .map((event, idx) => (
                    <EventCardWrapper key={idx}>
                      <strong>{event.title}</strong>
                      <div>Interviewer: {event.interviewer}</div>
                      <div>Time: {event.duration}</div>
                    </EventCardWrapper>
                  ))}
              </TimeSlot>
            ))}
          </React.Fragment>
        ))}
      </CalendarWrapper>
    </>
  );
};

export default Calendar;
