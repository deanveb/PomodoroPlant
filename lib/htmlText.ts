export const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.jsdelivr.net/npm/p5@1.6.0/lib/p5.min.js"></script>
<style>
body {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 500px;
}
canvas {
  display: block;
}
</style>
</head>
<body>
<script>
let rules = {
  X: [
    // Original rule
    { rule: "F[+X][+X]-F[-X][+X]FB", prob: 0.5 },
    { rule: "F[+X][-X][-X]-F[X][X]+F[-X][+X]+FB", prob: 0.25 },
    { rule: "F[-X][+X][+X]+F[X][X]-F[-X][+X]+FB", prob: 0.25 }
    //{ rule: "FF+[[X]-X]+F[-FX]+X", prob: 0.5}
  ],
  F: [
    { rule: "FF", prob: 0.9999 },
    { rule: "FFF", prob: 0.0001 },
  ]
};
const len = 6;
const ang = 25;
const numGens = 5;
let drawRules;
let word = "X";

function setup() {
  createCanvas(1000, 650);
  strokeWeight(2);
  clear(); // Clear the canvas initially
  
  drawRules = {
    /*"B": () => {
      strokeWeight(20);
      stroke(" #FBB7DD");
      line(0, 0, 0, -len);
      translate(0, -len);*/
    "B": () => {
      strokeWeight(1);
      stroke("#FBB7DD");
      fill("#FBB7DD")
      arc(0, 0, 35, 35, 180, 360, CHORD);
    },
    "F": () => {
      stroke("#BF8065");
      strokeWeight(6);
      line(0, 0, 0, -len);
      translate(0, -len);
    },
    "+": () => {
      rotate(PI/180 * -(ang+random(25)));
    },
    "-": () => {
      rotate(PI/180 * (ang+random(25)));
    },
    "[": push,
    "]": pop,
  };
  noLoop();
}

function draw() {
  // Use clear() instead of background(0) for transparency
  clear();
  
  // Generate our L-System from the start
  word = "X";
  for(let i = 0; i < numGens; i ++) {
    word = generate();
    console.log(word);
  }
  
  // Draw L-System
  push();
  translate(width/2, height);
  for(let i = 0; i < word.length; i ++) {
    let c = word[i];
    if(c in drawRules) {
      drawRules[c]();
    }
  }
  pop();
}

function generate() {
  let next = ""
  for(let i = 0; i < word.length; i ++) {
    let c = word[i];
    if(c in rules) {
      let rule = rules[c];
      // Check if we're using an array or not
      if(Array.isArray(rule)) {
        next += chooseOne(rule); // If we are, choose one of the options
      } else {
        next += rules[c]; // Otherwise use the rule directly
      }
    } else {
      next += c;
    }
  }
  return next;
}

function chooseOne(ruleSet) {
  let n = random(); // Random number between 0-1
  let t = 0;
  for(let i = 0; i < ruleSet.length; i++) {
    t += ruleSet[i].prob; // Keep adding the probability of the options to total
    if(t > n) { // If the total is more than the random value
      return ruleSet[i].rule; // Choose that option
    }
  }
  return "";
}

function saveCanvasImage() {
  // For better transparency in PNG exports
  const base64 = canvas.toDataURL('image/png');
  window.ReactNativeWebView.postMessage(base64);
}
</script>
</body>
</html>
`;