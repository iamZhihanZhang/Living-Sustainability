
document.getElementById('google-distance-matrix').addEventListener('submit', async(e) => {
  e.preventDefault();
  const fromValue = document.getElementById('google-from').value;
  const toValue = document.getElementById('google-to').value;
  try {
    const response = await fetch('/api/travel-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromValue,
        to: toValue
      })
    });
    const responseData = await response.json();
    const responseString = JSON.stringify(responseData, null, 2);
    document.getElementById('distance-matrix-response').innerText = responseString;
    console.log('travel time = ', responseData.rows[0].elements[0].duration.value);
  } catch (error) {
    console.log(error);
  }
});

document.getElementById('submitBtn-rawM').addEventListener('click', async() => {
  const inputText = document.getElementById('inputText-rawM').value;
  const jsonObject = {
    "materialName": inputText
  }
  const response = await fetch('/api/material-emissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonObject),
  });

  // Process the response from the server
  const responseData = await response.json();
  if (response.ok) {
    // Display the evaluated response
    document.getElementById('responseText-rawM').innerText = JSON.stringify(responseData);
  } else {
    // Display error message
    document.getElementById('responseText-rawM').innerText = `Error: ${responseData.error}`;
  }
});

document.getElementById('submitBtn').addEventListener('click', async () => {
  const inputText = document.getElementById('inputText').value;
  // Send the inputText to the server
  const jsonObject = {
    "text": inputText
  }
  const response = await fetch('/api/evaluate-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonObject),
  });

  // Process the response from the server
  const responseData = await response.json();
  console.log('responseData = ', responseData);
  if (response.ok) {
    // Display the evaluated response
    document.getElementById('responseText').innerText = JSON.stringify(responseData);
  } else {
    // Display error message
    document.getElementById('responseText').innerText = `Error: ${responseData.error}`;
  }
});

document.getElementById('freightForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const weight = document.getElementById('weight').value;
  const weightUnit = document.getElementById('weightUnit').value;

  const data = {
    route: [
      { location: { query: origin } },
      { transport_mode: "road" },
      { transport_mode: "sea" },
      { transport_mode: "road" },
      { location: { query: destination } }
    ],
    cargo: {
      weight: parseFloat(weight),
      weight_unit: weightUnit
    }
  };

  try {
    const response = await fetch('/api/freight', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();
    document.getElementById('apiResponse').innerText = JSON.stringify(responseData, null, 2);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('apiResponse').innerText = 'Error: ' + error.message;
  }
});

document.getElementById('add-text-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const textArea = document.querySelector('.textarea-lca');
  const textValue = textArea.value;

  if (textValue && textValue.trim() !== '') {
    const p = document.createElement('p');
    p.textContent = textValue;
    const container = document.querySelector('.text-container');
    container.appendChild(p);
    textArea.value = '';
  }

});