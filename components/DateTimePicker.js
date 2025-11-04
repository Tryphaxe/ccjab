"use client"

import React, { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateTimePicker({ label, value, onChange, disabledSlots = [] }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(value)
  const [time, setTime] = useState(() => {
    if (!value) return "10:30"
    return `${value.getHours().toString().padStart(2, "0")}:${value
      .getMinutes()
      .toString()
      .padStart(2, "0")}`
  })
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setTime(
        `${value.getHours().toString().padStart(2, "0")}:${value
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      )
    }
  }, [value])

  const isInDisabledSlot = (dt) => {
    if (!dt) return false;
    return disabledSlots.some(slot => dt >= slot.start && dt < slot.end);
  };

  // Fonction pour combiner date + heure et renvoyer au parent
  const updateDateTime = (selectedDate, selectedTime) => {
    if (!selectedDate) return
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const combined = new Date(selectedDate)
    combined.setHours(hours, minutes, 0)

    if (isInDisabledSlot(combined)) {
      setError("Ce créneau est déjà réservé pour cette salle.");
      return;
    }
    setError("");

    onChange(combined)
  }

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate)
    setOpen(false)
    updateDateTime(selectedDate, time)
  }

  const handleTimeChange = (e) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) updateDateTime(date, newTime)
  }

  const isDayDisabled = (day) => {
    // si pour toutes les heures d'une journée, il y a des créneaux qui couvrent la journée entière, on peut désactiver
    // Mais plus simple : si le jour contient au moins un créneau entier qui couvre toute la journée, on désactive le jour.
    // Ici on retourne false (ne pas bloquer le jour entier) — on bloquera à la sélection via isInDisabledSlot.
    return false;
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label className="px-1">{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              disabled={isDayDisabled}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label className="px-1">Time</Label>
        <Input
          type="time"
          step="60"
          value={time}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  )
}