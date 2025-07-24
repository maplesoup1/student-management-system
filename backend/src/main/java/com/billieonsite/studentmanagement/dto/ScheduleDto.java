package com.billieonsite.studentmanagement.dto;

import java.util.List;
import java.util.Map;

public class ScheduleDto {
    private Map<String, List<TimeSlot>> schedule;

    public static class TimeSlot {
        private String start;
        private String end;
        private String room;

        public TimeSlot() {}

        public TimeSlot(String start, String end, String room) {
            this.start = start;
            this.end = end;
            this.room = room;
        }

        public String getStart() {
            return start;
        }

        public void setStart(String start) {
            this.start = start;
        }

        public String getEnd() {
            return end;
        }

        public void setEnd(String end) {
            this.end = end;
        }

        public String getRoom() {
            return room;
        }

        public void setRoom(String room) {
            this.room = room;
        }
    }

    public ScheduleDto() {}

    public ScheduleDto(Map<String, List<TimeSlot>> schedule) {
        this.schedule = schedule;
    }

    public Map<String, List<TimeSlot>> getSchedule() {
        return schedule;
    }

    public void setSchedule(Map<String, List<TimeSlot>> schedule) {
        this.schedule = schedule;
    }
}