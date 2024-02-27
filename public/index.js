//oggetto modal js
const myModal = new bootstrap.Modal(
    document.getElementById("exampleModalToggle2")
  );
  //variabile per timer e nome utente
  let tempoDomande = 0;
  let giocatore = "";
  let domande = [];
  
  function generaTabella(div, lista) {
    div.innerHTML = "";
    let tableHTML = '<table id="tabellaRatings" class="table table-light table-striped">';
    tableHTML += "<thead><tr>";
    let headers = ["Username", "Timestamp", "Rating"];
    headers.forEach(function (headerText) {
      tableHTML += "<th>" + headerText + "</th>";
    });
    tableHTML += "</tr></thead><tbody>";
    lista.forEach(function (item) {
      let k = new Date(item.timestamp);
      tableHTML += "<tr>";
      tableHTML += "<td>" + item.username + "</td>";
      tableHTML += "<td>" + k.toLocaleDateString() + "</td>";
      tableHTML += "<td>" + item.rating + "</td>";
      tableHTML += "</tr>";
    });
  
    tableHTML += "</tbody></table>";
    div.innerHTML = tableHTML;
  }
  
  function ordinaPerRating(lista) {
    lista.sort((a, b) => b.rating - a.rating);
    return lista;
  }
  
  function generaModal(divHeader, divBody, obj) {
    divHeader.innerHTML = "";
    divBody.innerHTML = "";
    let testa =
      `<h1 class="modal-title fs-5" id="modalTitle">` +
      obj.title +
      `</h1>
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="modal"
      aria-label="Close"
    ></button>
                    `;
    divHeader.innerHTML = testa;
    let appoggio = "";
    for (let index = 0; index < obj.questions.length; index++) {
      let corpo =
        `<div class="card ` +
        index +
        `">
                   <p class="text-center">%QUESTION</p>
                  <div class="card-body container"><form class="form-control">
                    <div class="row">
                      <div class="col-6 form-check">
                      <input class="form-check-input" type="radio" id="radio1" name="radio` +
        index +
        `" value="%ANSWER1">
                      <label class="form-check-label" for="exampleRadios1">
                      %ANSWER1
                      </label></div>
                      <div class="col-6 form-check">
                      <input class="form-check-input" type="radio" id="radio2" name="radio` +
        index +
        `" value="%ANSWER2">
                      <label class="form-check-label" for="exampleRadios2">
                      %ANSWER2
                      </label></div>
                    </div>
                    <div class="row">
                      <div class="col-6 form-check">
                      <input class="form-check-input" type="radio" id="radio3" name="radio` +
        index +
        `" value="%ANSWER3">
                      <label class="form-check-label" for="exampleRadios3">
                      %ANSWER3
                      </label></div>
                      <div class="col-6 form-check">
                      <input class="form-check-input" type="radio" id="radio4" name="radio` +
        index +
        `" value="%ANSWER4">
                      <label class="form-check-label" for="exampleRadios4">
                      %ANSWER4
                      </label></div>
                    </div>
                    </form>
                  </div>
            </div>`;
      corpo = corpo.replace("%QUESTION", obj.questions[index].question);
      corpo = corpo.replaceAll("%ANSWER1", obj.questions[index].answers[0]);
      corpo = corpo.replaceAll("%ANSWER2", obj.questions[index].answers[1]);
      corpo = corpo.replaceAll("%ANSWER3", obj.questions[index].answers[2]);
      corpo = corpo.replaceAll("%ANSWER4", obj.questions[index].answers[3]);
      appoggio += corpo;
    }
    divBody.innerHTML = appoggio;
  }
  
  document.getElementById("inviaRisultati").onclick = () => {
    let dataCorrente = new Date();
    let rispUtente = {
      username: giocatore,
      timestamp: dataCorrente.getTime(),
      answers: [],
    };
    const inputs = document.querySelectorAll(".form-check-input");
    let counter = 0;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) {
        let obj = {
          id: domande[counter].id,
          value: inputs[i].id.replace("radio", ""),
        };
        rispUtente.answers.push(obj);
        counter++;
      }
    }
    send(rispUtente, "/answers");
    resetQuiz();
  };
  
  function avviaTimer(sec) {
    let elementoTimer = document.getElementById("timer");
    let tempoRimasto = sec;
    let intervalloTimer = setInterval(function () {
      elementoTimer.innerHTML = formattaT(tempoRimasto);
      tempoRimasto--;
      if (tempoRimasto < 0) {
        clearInterval(intervalloTimer);
        myModal.hide();
        resetQuiz();
      }
    }, 1000);
  }
  
  function formattaT(secondi) {
    let minuti = Math.floor(secondi / 60);
    let sec = secondi % 60;
    let formattato = minuti + ":";
    if (sec < 10) {
      formattato += "0" + sec;
    } else {
      formattato += sec;
    }
    return formattato;
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("inizioQuiz").onclick = () => {
      avviaTimer(tempoDomande);
      if (document.getElementById("nomeUtente").value !== "") {
        giocatore = document.getElementById("nomeUtente").value;
      } else {
        giocatore = "Anonymous";
      }
    };
  });
  
  const send = (t, url) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cose: t }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  
  const load = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          resolve(json);
        });
    });
  };
  
  const resetQuiz = () => {
    load("/ratings").then((data) => {
      generaTabella(
        document.getElementById("tabellaRisultati"),
        ordinaPerRating(data.ratings)
      );
    });
    document.getElementById("nomeUtente").value = "";
    load("/questions").then((data) => {
      tempoDomande = data.questions.timer;
      domande = data.questions.questions;
      generaModal(
        document.getElementById("modalHeader"),
        document.getElementById("modalBody"),
        data.questions
      );
    });
  };
  
  resetQuiz();
  