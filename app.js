const API =
'https://api.openf1.org/v1';

const sessionName =
document.getElementById('sessionName');

const timingTower =
document.getElementById('timingTower');

const weatherWidget =
document.getElementById('weatherWidget');

const raceControlWidget =
document.getElementById('raceControlWidget');

const radioWidget =
document.getElementById('radioWidget');

const driverFocusPanel =
document.getElementById('driverFocusPanel');

const trackMap =
document.getElementById('trackMap');

const TEAM_COLORS = {

  'Red Bull Racing':'#1E5BC6',
  'Ferrari':'#DC0000',
  'Mercedes':'#00D2BE',
  'McLaren':'#FF8700',
  'Aston Martin':'#006F62',
  'Alpine':'#0090FF',
  'Williams':'#005AFF',
  'RB':'#6692FF',
  'Kick Sauber':'#52E252',
  'Haas F1 Team':'#FFFFFF'
};

let currentSession = null;

let drivers = [];

async function initialize(){

  try{

    sessionName.innerHTML =
    'Connecting To OpenF1...';

    const sessionResponse =
    await fetch(`${API}/sessions`);

    const sessions =
    await sessionResponse.json();

    if(
      !Array.isArray(sessions) ||
      !sessions.length
    ){

      sessionName.innerHTML =
      'No Live Session';

      return;
    }

    currentSession =
    sessions[sessions.length - 1];

    sessionName.innerHTML =

      `${

        currentSession.meeting_name ||

        'Unknown Event'

      } - ${

        currentSession.session_name ||

        'Unknown Session'

      }`;

    await Promise.all([

      loadDrivers(),
      loadWeather(),
      loadRaceControl(),
      loadRadio()

    ]);

  }

  catch(error){

    console.log(error);

    sessionName.innerHTML =
    'Dashboard Failed';
  }
}

async function loadDrivers(){

  try{

    const response =

    await fetch(

      `${API}/drivers?session_key=${currentSession.session_key}`
    );

    drivers =
    await response.json();

    if(
      !Array.isArray(drivers) ||
      !drivers.length
    ){

      timingTower.innerHTML =
      'No Driver Data';

      return;
    }

    renderTimingTower();
    renderTrackDots();

  }

  catch(error){

    console.log(error);

    timingTower.innerHTML =
    'Timing Failed';
  }
}

function renderTimingTower(){

  timingTower.innerHTML = '';

  drivers.forEach((driver,index)=>{

    const row =
    document.createElement('div');

    row.className =
    'driver-row';

    row.style.borderLeft =

    `4px solid ${

      TEAM_COLORS[
        driver.team_name
      ] || '#00D2BE'

    }`;

    row.innerHTML = `

      <div class="driver-name">

        P${index + 1}

        ${driver.name_acronym}

      </div>

      <div class="team-name">

        ${driver.team_name}

      </div>
    `;

    row.onclick = ()=>{

      renderDriverFocus(
        driver,
        index + 1
      );
    };

    timingTower.appendChild(row);
  });
}

function renderDriverFocus(
driver,
position
){

  driverFocusPanel.innerHTML = `

    <div class="widget">

      <b>Driver:</b>

      ${driver.full_name}

      <br><br>

      <b>Team:</b>

      ${driver.team_name}

      <br><br>

      <b>Position:</b>

      P${position}

      <br><br>

      <b>Number:</b>

      #${driver.driver_number}

    </div>
  `;
}

function renderTrackDots(){

  document

  .querySelectorAll('.driver-dot')

  .forEach(dot=>dot.remove());

  document

  .querySelectorAll('.driver-label')

  .forEach(label=>label.remove());

  drivers.forEach((driver,index)=>{

    const progress =
    index / drivers.length;

    const x =
    180 + progress * 620;

    const y =

    300 +

    Math.sin(
      progress * Math.PI * 2
    ) * 140;

    const dot =

    document.createElementNS(

      'http://www.w3.org/2000/svg',

      'circle'
    );

    dot.setAttribute('cx',x);
    dot.setAttribute('cy',y);

    dot.setAttribute('r',8);

    dot.setAttribute(

      'fill',

      TEAM_COLORS[
        driver.team_name
      ] || '#00D2BE'
    );

    dot.setAttribute(
      'class',
      'driver-dot'
    );

    trackMap.appendChild(dot);

    const label =

    document.createElementNS(

      'http://www.w3.org/2000/svg',

      'text'
    );

    label.setAttribute(
      'x',
      x + 12
    );

    label.setAttribute(
      'y',
      y + 4
    );

    label.setAttribute(
      'class',
      'driver-label'
    );

    label.textContent =
    driver.name_acronym;

    trackMap.appendChild(label);
  });
}

async function loadWeather(){

  try{

    const response =

    await fetch(

      `${API}/weather?session_key=${currentSession.session_key}`
    );

    const weather =
    await response.json();

    if(
      !Array.isArray(weather) ||
      !weather.length
    ){

      weatherWidget.innerHTML =
      'No Weather Data';

      return;
    }

    const latest =
    weather[weather.length - 1];

    weatherWidget.innerHTML = `

      Air Temp:

      ${latest.air_temperature}°C

      <br><br>

      Track Temp:

      ${latest.track_temperature}°C

      <br><br>

      Humidity:

      ${latest.humidity}%
    `;
  }

  catch(error){

    weatherWidget.innerHTML =
    'Weather Failed';
  }
}

async function loadRaceControl(){

  try{

    const response =

    await fetch(

      `${API}/race_control?session_key=${currentSession.session_key}`
    );

    const data =
    await response.json();

    if(
      !Array.isArray(data) ||
      !data.length
    ){

      raceControlWidget.innerHTML =
      'No Race Control Data';

      return;
    }

    raceControlWidget.innerHTML =

      data

      .slice(-5)

      .map(item=>item.message)

      .join('<br><br>');
  }

  catch(error){

    raceControlWidget.innerHTML =
    'Race Control Failed';
  }
}

async function loadRadio(){

  try{

    const response =

    await fetch(

      `${API}/team_radio?session_key=${currentSession.session_key}`
    );

    const data =
    await response.json();

    if(
      !Array.isArray(data) ||
      !data.length
    ){

      radioWidget.innerHTML =
      'No Team Radio';

      return;
    }

    radioWidget.innerHTML =

      data

      .slice(-5)

      .map(item=>

        'Driver #' +

        item.driver_number
      )

      .join('<br><br>');
  }

  catch(error){

    radioWidget.innerHTML =
    'Radio Failed';
  }
}

initialize();