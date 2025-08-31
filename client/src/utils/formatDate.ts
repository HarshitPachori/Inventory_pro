const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

const formatDate = (time: string) => {
  const date = new Date(time);
if(date.toString() === new Date(0).toString()){
  return "";
}
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

export default formatDate