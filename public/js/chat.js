const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

socket.on("message", msg => {
  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    createdAt: moment(msg.createdAt).format("k:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", ({ location, createdAt }) => {
  const html = Mustache.render(locationTemplate, {
    location,
    createdAt: moment(createdAt).format("k:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const msg = e.target.elements.message.value;

  socket.emit("sendMessage", msg, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      console.log(error);
    }

    console.log("the message was delivered.");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not support by your browser");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "location",
      {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("the location was delivered.");
      }
    );
  });
});
