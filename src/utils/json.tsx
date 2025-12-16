const COVER_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/quiz-res/o/quiz%2Fcover%2F";

const getCoverUrl = (img_name: string) => {
  return `${COVER_BASE_URL}${img_name}.jpg?alt=media`;
}

const cloud_data = [{
  "sort": -107,
  "img_name": "male_test_daily168",
  "cover": getCoverUrl("cover_male_test_daily168"),
  "tab": "humor",
  "title": "What kind of meme are you?",
  "subtitle": "Click to see how truly abstract you are.",
  "module_type": "G",
  "isNew": "1",
  "isHot": "0",
  "text1": "You as a meme",
  "text2": "You as a meme",
  "text3": "You as a meme",
  "text4": "You as a meme",
  "text5": "You as a meme",
},
{
  "sort": -106,
  "img_name": "male_test_daily169",
  "cover": getCoverUrl("cover_male_test_daily169"),
  "tab": "humor",
  "title": "You are the CEO of \"Chaos Corp.\" What is your very first new policy",
  "subtitle": "Please speak rationally.",
  "module_type": "A2",
  "isNew": "1",
  "isHot": "0",
  "text1": "Mandatory nap at 3 PM — offenders get iced coffee.",
  "text2": "Sleepwear meetings allowed — comfort equals productivity.",
  "text3": "All reports must be sung or rapped — no exceptions.",
  "text4": "Weekly snack desk inspection — the snacking champion gets promoted.",
  "text5": "Institute a “Chaos Award” for the most absurd office behavior.",
}
]