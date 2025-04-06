
const no2 = /^([(][1-9]{3})[)]\ \d{3}[-]\d{4}$/;
const no3 = /^[A-Z]/;
const no4 = /^[0-9]/;
const no5 = /#\w+/g;
const no6 = /^(http|https):\/\/(www|[a-zA-Z]).[a-zA-Z]+.[a-zA-Z]{2,}/
const no7 = /^\d{2}\/\d{2}\/\d{4}$/;
const no8 = /\d+/g;
const  no9 = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){8,}/g
const no10 = /^#[a-fA-F0-9]{6}$/g;
const no11 = /^\d{2,3}.\d{1,3}.\d{1,3}.\d{1,3}$/


const no14  = /^[0-2][0-3]:[0-5][0-9]$/ 
const no15 = /^\d{4}[- ]\d{4}[- ]\d{4}[ -]\d{4}$/



const phoneNumber = "4111 1111 1111 1111";

// console.log(creditCard.test(phoneNumber)); // true
// console.log(phoneNumber.match(duplicate)); // true
