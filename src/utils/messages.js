const generateMessage = (text, username) => {
  return {
    text,
    createdAt: new Date().getTime(),
    username
  };
};

const generateLocationMessage = (location, username) => {
  return {
    location: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
    createdAt: new Date().getTime(),
    username
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
