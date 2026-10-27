(function(root){
  function availableDates(now=new Date(),days=35,seasonal=false,conchas=false){

    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
    const local=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    const base=new Date(Date.UTC(+local.year,+local.month-1,+local.day));
    const result=[];
    for(let offset=1;offset<=days;offset++){
      const date=new Date(base);date.setUTCDate(base.getUTCDate()+offset);
      const weekdays=[0,4];
      if(!weekdays.includes(date.getUTCDay()))continue;
      // Fixed Irish-local cutoff, rather than a rolling number of hours.
      if(offset===1&&+local.hour>=18)continue;
      const value=date.toISOString().slice(0,10);
      if(seasonal&&value>'2026-11-05')continue;
      result.push(value);
    }
    return result;
  }
  root.RaizSchedule={availableDates};
  if(typeof module!=='undefined')module.exports=root.RaizSchedule;
})(typeof window==='undefined'?globalThis:window);
