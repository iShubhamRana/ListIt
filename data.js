

exports.getDay= ()=>{
const today = new Date();
const options= {
    weekday:'long' ,
    day:'numeric',
    month:'long'
}  
 day = today.toLocaleDateString('en-US' , options); 
 return day;
}
exports.Day = ()=>{
    const today = new Date();
    const options= {
        weekday:'long' ,     
}  
 day = today.toLocaleDateString('en-US' , options); 
  return day;
 }