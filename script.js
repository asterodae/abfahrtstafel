function startTime() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  h = checkTime(h);
  m = checkTime(m);
  document.getElementById('clock').innerHTML =  h + '<span class="blink">:</span>' + m;
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

const inputField = document.getElementById("station");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const closeButton = document.getElementById("closeButton");

// closeButton.addEventListener("click", function() { 
// 	  document.getElementById("title").style.display="none"; 
//   });

locationButton.addEventListener("click", function() {
      navigator.geolocation.getCurrentPosition(showStopsOnMap, handleError);
      function showStopsOnMap(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const locationUrl = `https://v6.db.transport.rest/stops/nearby?latitude=${latitude}&longitude=${longitude}`;
        if(!inputField.value) {
          fetch(locationUrl)
            .then(response => response.json())
            .then(data => createDropdown(data))
            .catch(error => console.error(error));
        };
  }});


  searchButton.addEventListener("click", function() {
    const input = inputField.value;
    const url = `https://v6.db.transport.rest/locations?query=${input}&results=5&fuzzy=true`;

  if(input != undefined) {
    fetch(url)
      .then(response => response.json())
      .then(data => createDropdown(data))
      .catch(error => console.error(error));
    }});

    inputField.addEventListener("keydown", function(event) {
      if (event.key == 'Enter') { // Enter key has keyCode 13
        searchButton.click();
      }
    });

  function createDropdown(data) {
    const dropdown = document.createElement("select");
    dropdown.id = "stop-dropdown"; // Added an ID for selection
    const existingDropdown = document.getElementById("stop-dropdown");
  if (existingDropdown) {
    existingDropdown.remove(); // Remove existing dropdown
  };

    data.forEach(stop => {
      const option = document.createElement("option");
      option.value = stop.id;
      option.text = `${stop.name}`;
      dropdown.add(option);
    });


    getDepartures({ target: { value: dropdown.value } });
  
    dropdown.addEventListener("change", getDepartures); // Added event listener
  
    // Add the dropdown to the desired location in your HTML
    document.getElementById("dropdown-container").appendChild(dropdown);
  }
  
  function getDepartures(event) {
    const selectedStopId = event.target.value;
    const url = `https://v6.db.transport.rest/stops/${selectedStopId}/departures?results=5&duration=60&language=de`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => displayDepartures(data))
      .catch(error => console.error(error));
  }
  
  function displayDepartures(data) {
    const tableBody = document.getElementById("departures-table").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear previous data
  
    // Check if data is an array, otherwise wrap it in a single-element array
    const departures = Array.isArray(data) ? data : [data];
  
    departures.forEach(departure => {
      const tableRow = document.createElement("tr");
      tableRow.setAttribute("class", "transit");

      const delayMinute = new Date(departure.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const departureTime = new Date(departure.plannedWhen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const direction = departure.direction;
      const product = departure.line.product;
      const lineNumber = departure.line.name;

      if(!departure.cancelled) {
        remarksText = "";
      } else {
        remarksText = '<span class="remarks">Fahrt fällt aus.</span>'
      }

      if(!departure.platform) {
        gleisNummer = "";
      } else {
        gleisNummer = '<br>Abfahrt auf <span class="semibold">Gleis ' + departure.platform + ".";
      }

      if(!departure.when) {
        aktuelleZeit = "";
      } else {
        aktuelleZeit = new Date(departure.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      if(!departure.cancelled) {
        lineDeparture = ' <span class="semibold">' + lineNumber + '</span> nach <span class="semibold">' + direction + '</span>';
      } else {
        lineDeparture = ' <span class="strikethrough"><span class="semibold">' + lineNumber + '</span> nach <span class="semibold">' + direction + '</span></span>'
      }

      switch (product) {
        case "regional":
          productc = "train";
          break;
        case "bus":
          productc = "directions_bus";
        break;
        case "suburban":
          productc = '<img src="./img/s-bahn.svg" height="24" />';
        break;
        case "tram":
          productc = "tram";
        break;
        case "subway":
          productc = '<img src="./img/u-bahn-hh.svg" height="24" />';
          break;
        case "regionalExp": // aka flixtrain lol
          productc = "train";
          break;
        case "nationalExpress":
          productc = "train";
          break;
        case "national":
          productc = "train";
          break;
        case "taxi":
          productc = "local_taxi";
          break;
      }


      const departureTimeCell = document.createElement("td");
      departureTimeCell.innerHTML = departureTime + '<span id="delay"><br>' + aktuelleZeit + "</span>";
      tableRow.appendChild(departureTimeCell);

      const directionCell = document.createElement("td");
      directionCell.innerHTML = `<span class="product material-icons" id=${product}>` + productc + "</span>" + lineDeparture + gleisNummer + remarksText;
      tableRow.appendChild(directionCell);

      tableBody.appendChild(tableRow);
    });
  }
  
  
  function handleError(error) {
    console.error(error.message);
    alert("Failed to get your location.");
  }
