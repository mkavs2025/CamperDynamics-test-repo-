export const DEFAULT_AVAILABILITY={days:[1,2,3,4,5,6],times:['10:00','11:00','14:00','15:00','16:00'],blocked:[],timezone:'Asia/Kolkata'};

export function validateSlot(value,availability=DEFAULT_AVAILABILITY,now=Date.now()){
 const date=new Date(value);if(!Number.isFinite(+date)||+date<now+3600000||+date>now+180*86400000)throw Error('Choose a future slot within 180 days.');if(date.getUTCSeconds()!==0||date.getUTCMilliseconds()!==0)throw Error('Choose an exact appointment time.');const ist=new Date(+date+330*60000),day=ist.getUTCDay(),ymd=ist.toISOString().slice(0,10),time=ist.toISOString().slice(11,16);if(!availability.days.includes(day)||!availability.times.includes(time)||availability.blocked.includes(ymd))throw Error('That slot is not available.');return date.toISOString();
}

export function bookingTransition(booking,change,admin,availability,now=Date.now()){
 const terminal=['cancelled','completed'].includes(booking.status);
 if(terminal){if(change.slot||change.status!==booking.status)throw Error('Closed bookings cannot be reopened; create a new request.');return {status:booking.status,slot:null,data:booking.data};}
 let status=change.status||booking.status,slot=booking.slot,data={...booking.data};
 if(change.slot){if(change.status&&change.status!=='requested')throw Error('A rescheduled appointment must be requested again.');slot=validateSlot(change.slot,availability,now);data.slot=slot;status='requested';}
 else if(!admin&&status!=='cancelled')throw Error('Customers can reschedule or cancel appointments.');
 if(!['requested','confirmed','cancelled','completed'].includes(status))throw Error('Invalid booking status');
 if(!admin&&!change.slot&&status!=='cancelled')throw Error('Team confirmation required');
 if(['cancelled','completed'].includes(status))slot=null;
 return {status,slot,data};
}
