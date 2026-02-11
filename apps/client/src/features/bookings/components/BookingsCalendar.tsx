import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import type { Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import type { IBooking } from '@rental/shared';

// Import calendar base styles then our overrides
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './bookings-calendar.css';

// date-fns localizer config
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Status → color mapping
const statusColors: Record<string, { bg: string; border: string }> = {
  CONFIRMED: { bg: 'hsl(142, 71%, 45%)', border: 'hsl(142, 71%, 35%)' },  // Green
  PENDING:   { bg: 'hsl(45, 93%, 47%)',  border: 'hsl(45, 93%, 37%)' },   // Yellow/Amber
  CANCELLED: { bg: 'hsl(0, 0%, 55%)',    border: 'hsl(0, 0%, 45%)' },     // Gray
  COMPLETED: { bg: 'hsl(217, 91%, 60%)', border: 'hsl(217, 91%, 50%)' },  // Blue
};

interface BookingEvent extends Event {
  resource: IBooking;
}

// Helper to get apartment/tenant names from populated booking
const getApartmentName = (b: IBooking): string =>
  (b as any).apartment?.name || 'Apartment';

const getTenantName = (b: IBooking): string => {
  const t = (b as any).tenant;
  return t ? `${t.firstName} ${t.lastName}` : 'Tenant';
};

interface BookingsCalendarProps {
  bookings: IBooking[];
}

export function BookingsCalendar({ bookings }: BookingsCalendarProps) {
  const navigate = useNavigate();

  // Map bookings to calendar events
  const events: BookingEvent[] = useMemo(
    () =>
      bookings.map((booking) => ({
        title: `${getTenantName(booking)} — ${getApartmentName(booking)}`,
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
        resource: booking,
      })),
    [bookings]
  );

  // Navigate to booking details on click
  const handleSelectEvent = useCallback(
    (event: BookingEvent) => {
      navigate(`/bookings/${event.resource._id}`);
    },
    [navigate]
  );

  // Custom event styling based on booking status
  const eventPropGetter = useCallback((event: BookingEvent) => {
    const colors = statusColors[event.resource.status] || statusColors.PENDING;
    return {
      style: {
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        borderRadius: '4px',
        color: event.resource.status === 'PENDING' ? '#1a1a1a' : '#ffffff',
        fontSize: '0.8rem',
        padding: '2px 6px',
        fontWeight: 500,
      },
    };
  }, []);

  return (
    <div className="bookings-calendar-wrapper">
      {/* @ts-expect-error react-big-calendar types incompatible with React 19 */}
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        popup
        style={{ height: 700 }}
        messages={{
          today: 'Today',
          previous: '←',
          next: '→',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          agenda: 'Agenda',
          noEventsInRange: 'No bookings in this range.',
        }}
      />
    </div>
  );
}
