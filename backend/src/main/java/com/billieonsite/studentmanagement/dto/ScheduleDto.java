package com.billieonsite.studentmanagement.dto;

import java.util.List;

public class ScheduleDto {
    private List<String> days;
    private String time;
    private String room;
    private String duration;
    
    public ScheduleDto() {}
    
    public ScheduleDto(List<String> days, String time, String room) {
        this.days = days;
        this.time = time;
        this.room = room;
    }
    
    public ScheduleDto(List<String> days, String time, String room, String duration) {
        this.days = days;
        this.time = time;
        this.room = room;
        this.duration = duration;
    }
    
    public List<String> getDays() {
        return days;
    }
    
    public void setDays(List<String> days) {
        this.days = days;
    }
    
    public String getTime() {
        return time;
    }
    
    public void setTime(String time) {
        this.time = time;
    }
    
    public String getRoom() {
        return room;
    }
    
    public void setRoom(String room) {
        this.room = room;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
}