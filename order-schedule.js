(function(root){
  function availableDates(now=new Date(),days=35,seasonal=false,conchas=false){

    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
    const local=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    const base=new Date(Date.UTC(+local.year,+local.month-1,+local.day));
    const result=[];
    for(let offset=1;offset<=days;offset++){
      const date=new Date(base);date.setUTCDate(base.getUTCDate()+offset);
      const november=date.getUTCFullYear()===2026&&date.getUTCMonth()===10;
      const weekdays=november?[1,4]:seasonal&&conchas?[4]:seasonal?[0,4]:conchas?[1,4]:[0,1,4];
      if(!weekdays.includes(date.getUTCDay()))continue;
      // Fixed Irish-local cutoff, rather than a rolling number of hours.
      if(offset===1&&+local.hour>=18)continue;
      const value=date.toISOString().slice(0,10);
      if(seasonal&&value>'2026-11-05')continue;
      result.push(value);
    }
    return result;
  }
  function pickupOnly(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T12:00:00Z').getUTCDay()===1;}
  root.RaizSchedule={availableDates,pickupOnly};
  if(typeof module!=='undefined')module.exports=root.RaizSchedule;
})(typeof window==='undefined'?globalThis:window);
