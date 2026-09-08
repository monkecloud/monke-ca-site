const FROG_CONTENT_A = `
   oO)-.
  /__  _\\
  \\  \\(  |
   \\__|\\ |
   '  '--'
`;
const FROG_CONTENT_B = `
ribbit...
   *
   oO)-.
  /--  _\\
  \\  \\(  |
   \\__|\\ |
   '  '--'
`;

let frog_counter = 0;
let ribbit_on = 2;
let ribbit_period = 20;

const getRandomInt = (max) => Math.floor(Math.random() * max);

const init = () => {
  // escape to clear focus
  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  });

  // hydrate frog
  const frog_element = document.getElementById("frog-corner");
  frog_element.textContent = FROG_CONTENT_A;

  setInterval(() => {
    if (frog_counter === ribbit_period - ribbit_on) {
      frog_element.textContent = FROG_CONTENT_B;
    } else if (frog_counter === 0) {
      frog_element.textContent = FROG_CONTENT_A;
    }

    frog_counter = (frog_counter + 1) % ribbit_period;
    if (frog_counter === 0) {
      ribbit_period = 20 + getRandomInt(20);
      ribbit_on = 1 + getRandomInt(3);
    }
  }, 400);

  frog_element.onclick = () => {
    frog_element.textContent = FROG_CONTENT_B;
    frog_counter = ribbit_period - ribbit_on;
  };
};

document.addEventListener("DOMContentLoaded", init);
