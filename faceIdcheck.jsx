function checkFakeID(user) {
  let fakeScore = 0;
  if (user.reports >= 3) fakeScore++;
  // Photo Google check logic neenga backend la add pannanum da
  // Voice match logic

  if (fakeScore >= 1) {
    alert("ALERT! Idhu FAKE ID da! Nambaatha da!");
    return true;
  }
  return false;
}
