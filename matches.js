(function(){

const OPERATORS_ICONS_URL_BASE = 'https://raw.githubusercontent.com/AviNat/matches/3feedf2a4d0976301300c996da7a1fdaeb8e8efd/';

/**
* container     : element to contain the matchsticks puzzle (existing content is removed)
* q             : query/puzzle string, e.g: 1+2=3*4
*                   *no spaces* must be valid expression with only numbers and operators
* solveCallback : a function to be called when the user solves the matchsticks puzzle
*/
function createMatchsticks(container, q, solveCallback) {
  if (!(container instanceof HTMLElement)) {
    console.error('failed to create matchsticks puzzle: expected container to be HTMLElement');
    return;
  }
  if (!(solveCallback instanceof Function)) {
    console.error('failed to create matchsticks puzzle: expected solveCallback to be a function');
    return;
  }

  function injectCssOnce(rules) {
    if (document.querySelector('head style#sv-matchsticks-css')) {
      return;
    }
    const styleEl = document.createElement('style');
    styleEl.id = 'sv-matchsticks-css';
    document.head.appendChild(styleEl);
    const s = styleEl.sheet;
    for (const r of rules) {
      s.insertRule(r, s.cssRules.length);
    }
  }

  let nextDigitId = 0;
  function createDigitElement(parent) {
    const digitId = nextDigitId;
    nextDigitId++;
    
    const digitHtml = `
<div name="0" class="segV" style="left: 0; top: 0;">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span>
</div>
<div name="1" class="segV" style="left: 0; bottom: calc(var(--segSize) * 2);">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span>
</div>
<div name="2" class="segH" style="top: 0;">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span>
</div>
<div name="3" class="segH" style="top: 50%">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span></div>
<div name="4" class="segH" style="bottom: 0;">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span></div>
<div name="5" class="segV" style="right: 0; top: 0;">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span>
</div>
<div name="6" class="segV" style="right: 0; bottom: calc(var(--segSize) * 2);">
  <span class="segPartA"></span>
  <span class="segPartB"></span>
  <span class="segBody"></span>
</div>`;
    
    const digitEl = document.createElement('div');
    digitEl.className = 'digit';
    digitEl.id = 'digit' + digitId;
    digitEl.innerHTML = digitHtml;
    const segBodies = digitEl.querySelectorAll('.segBody');
    for (const x of segBodies) {
      x.addEventListener('click', function(e) {
        return onSegClick(this.parentElement);
      });
    }
    parent.appendChild(digitEl);
    
    return digitEl;
  }

  function createOperatorElement(op, parent) {
    const opEl = document.createElement('div');
    opEl.className = 'operator';
    opEl.innerHTML = '<img style="width: 100%; height: 100%;" src="' + OPERATORS_ICONS_URL_BASE + op + '.png" />';
    parent.appendChild(opEl);
  }

	injectCssOnce([
`.sv-matchsticks {
  --digitWidth: 80px;
  --segPad: 2px;
  --segSize: calc(var(--digitWidth) * 0.1);
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}`,
`.sv-matchsticks .operator {
  position: relative;
  width: calc(var(--digitWidth) * 0.75);
  height: calc(var(--digitWidth) * 0.75);
  margin: calc(2 * var(--segSize) + var(--segPad));
  top: calc(var(--digitWidth) - var(--digitWidth) * 0.375);
  float: left;
}`,
`.sv-matchsticks .digit {
  position: relative;
  width: var(--digitWidth);
  height: calc(var(--digitWidth) * 2);
  margin: calc(2 * var(--segSize) + var(--segPad));
  float: left;
}`,
`.sv-matchsticks .segH {
  display: block;
  position: absolute;
  width: calc(100% - (var(--segSize) + var(--segPad)) * 2);
  height: 0;
  margin: 0 var(--segPad);
  cursor: pointer;
}`,
`.sv-matchsticks .segH span {
  display: block;
  position: absolute;
  width: 100%;
  height: 0;
  margin: 0;
}`,
`.sv-matchsticks .segH .segBody {
  width: 100%;
  height: calc(var(--segSize) * 2);
  top: calc(-1 * var(--segSize));
  left: calc(var(--segSize));
}`,
`.sv-matchsticks .segH .segPartA {
  top: calc(-1 * var(--segSize));
  border-bottom: var(--segSize) solid dodgerblue;
  border-left: var(--segSize) solid transparent;
  border-right: var(--segSize) solid transparent;
}`,
`.sv-matchsticks .segH .segPartB {
  top: 0;
  border-top: var(--segSize) solid dodgerblue;
  border-left: var(--segSize) solid transparent;
  border-right: var(--segSize) solid transparent;
}`,
`.sv-matchsticks .segV {
  display: block;
  position: absolute;
  height: calc(50% - (var(--segSize) + var(--segPad)) * 2);
  width: 0;
  margin: var(--segPad) 0;
  cursor: pointer;
}`,
`.sv-matchsticks .segV span {
  display: block;
  position: absolute;
  width: 0;
  height: 100%;
  margin: 0;
}`,
`.sv-matchsticks .segV .segBody {
  width: calc(var(--segSize) * 2);
  height: 100%;
  top: calc(var(--segSize));
  left: calc(var(--segSize) * -1);
}`,
`.sv-matchsticks .segV .segPartA {
  left: calc(-1 * var(--segSize));
  border-right: var(--segSize) solid dodgerblue;
  border-top: var(--segSize) solid transparent;
  border-bottom: var(--segSize) solid transparent;
}`,
`.sv-matchsticks .segV .segPartB {
  left: 0;
  border-left: var(--segSize) solid dodgerblue;
  border-top: var(--segSize) solid transparent;
  border-bottom: var(--segSize) solid transparent;
}`,
`.sv-matchsticks .seg-off {
  opacity: 0.1;
}`,
`.sv-matchsticks .holdingZone {
  display: table;
  position: relative;
  width: calc(var(--digitWidth));
  margin: calc(var(--segSize) * 4) auto calc(var(--segSize) * 3) auto;
}`,
`.sv-matchsticks .button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 8px 12px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 0;
  cursor: pointer;
}`,
`.sv-matchsticks .solved {
  background-color: dodgerblue !important;
}`
	]);

  container.classList.add('sv-matchsticks');
  container.innerHTML = `
<div class="holdingZone" unselectable="on" onselectstart="return false;">
  <div class="holdIndicator segH" style="left: 0; top: 50%;">
    <span class="segPartA"></span>
    <span class="segPartB"></span>
    <span style="left: var(--segSize); top: -10px; text-align: center;" onmousedown="return false;">
      <strong>?</strong>
    </span>
  </div>
</div>
<div id="subContainer" style="display: table; margin: 0 auto;" unselectable="on" onselectstart="return false;">
</div>
<div style="display: table; margin: calc(var(--segSize) * 2) auto 0 auto" unselectable="on" onselectstart="return false;">
  <input id="btnReset" type="button" class="button" dir="rtl" value="נסו שוב">
</div>
`;
  const subContainer = container.querySelector('#subContainer');
  const elBtnReset = container.querySelector('#btnReset');
  const elHoldIndicator = container.querySelector('.holdIndicator');

  elBtnReset.addEventListener('click', function(e) {
    resetSticks();
    return false;
  });
  setHeldStickVisible(false);
  
  function setHeldStickVisible(state) {
    elHoldIndicator.style.display = state ? 'block' : 'none';
    clearSelection();
  }
  
  function clearSelection() {
    if (document.selection) {
      document.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }  
  
  const digitValToSegments =
   [[1,1,1,0,1,1,1], // 0
    [0,0,0,0,0,1,1], // 1
    [0,1,1,1,1,1,0], // 2
    [0,0,1,1,1,1,1], // 3
    [1,0,0,1,0,1,1], // 4
    [1,0,1,1,1,0,1], // 5
    [1,1,1,1,1,0,1], // 6
    [0,0,1,0,0,1,1], // 7
    [1,1,1,1,1,1,1], // 8
    [1,0,1,1,1,1,1]]; // 9

  const digitToDigit =
   [[[8,[3]],[6,[3,5]],[9,[1,3]]],			// #0 to 8, 6*, 9*
    [[7,[2]]],								// #1 to 7
    [[3,[1,6]]],							// #2 to 3*
    [[9,[0]],[2,[1,6]],[5,[0,5]]],			// #3 to 9, 2*, 5*
    [],										// #4 to nothing
    [[6,[1]],[9,[5]],[3,[0,5]]],			// #5 to 6, 9, 3*
    [[5,[1]],[8,[5]],[9,[1,5]],[0,[3,5]]],	// #6 to 5, 8, 9*, 0*
    [[1,[2]]],								// #7 to 1
    [[0,[3]],[6,[5]],[9,[1]]],				// #8 to 0, 6, 9
    [[3,[0]],[5,[5]],[8,[1]],[0,[1,3]],[6,[1,5]]]];	// #9 to 3, 5, 8, 0*, 6*

  let isSolved = false;	
  let numOfMovesMade = 0;
  let isHoldingStick = false;
  let forcedDropTarget = null;
  let forcedDropIndices = [];
  let sourceSeg = null;
	let questionElements = [];
  let questionWidthFactor = 0;
  
  function resetSticks() {
    if (isSolved)
      return;
    
    elBtnReset.style.opacity = '0.5';
    numOfMovesMade = 0;
    isHoldingStick = false;
    setHeldStickVisible(false);
    forcedDropTarget = null;
    sourceSeg = null;
    
    readQuestion();
  }
  
  function onSegClick(seg) {
    if (isSolved)
      return false;

    const digit = seg.parentElement;
    const digitCurrVal = readDigitSegs(digit);
    const segIdx = parseInt(seg.getAttribute('name'));
    
    if (isHoldingStick) {
      // can only drop matchstick on segments that are off
      if (getSegState(seg))
        return false;
      
      if (seg == sourceSeg) {
        elBtnReset.style.opacity = '0.5';
        numOfMovesMade = 0;
        setSegState(seg, true);
        isHoldingStick = false;
        setHeldStickVisible(false);
        forcedDropTarget = null;
        checkAnswer();
        return true;
      }

      if (forcedDropTarget == null) {
        if (digitCurrVal == -1)
          return false;
        
        const digitRelations = digitToDigit[digitCurrVal];
        
        // check for direct toggle
        for (let i = 0; i < digitRelations.length; i++) {
          let rel = digitRelations[i];
          if (rel[1].length == 1 && rel[1][0] == segIdx) {
            setSegState(seg, true);
            isHoldingStick = false;
            setHeldStickVisible(false);
            checkAnswer();
            return true;
          }
        }
      }
      
      if (forcedDropTarget != digit)
        return false;
      
      for (let i = 0; i < forcedDropIndices.length; i++) {
        if (forcedDropIndices[i] == segIdx) {
          setSegState(seg, true);
          isHoldingStick = false;
          setHeldStickVisible(false);
          forcedDropTarget = null;
          checkAnswer();
          return true;
        }
      }

      return false;
    }
    // Not holding a matchstick
    else {
      if (numOfMovesMade > 0)
        return false;

      if (digitCurrVal == -1)
        return false;

      // can only pick-up matchstick from segments that are on
      if (!getSegState(seg))
        return false;
        
      const digitRelations = digitToDigit[digitCurrVal];
      
      // check for direct toggle
      for (let i = 0; i < digitRelations.length; i++) {
        let rel = digitRelations[i];
        if (rel[1].length == 1 && rel[1][0] == segIdx) {
          elBtnReset.style.opacity = '1';
          numOfMovesMade++;
          setSegState(seg, false);
          sourceSeg = seg;
          isHoldingStick = true;
          setHeldStickVisible(true);
          forcedDropTarget = null;
          return true;
        }
      }
      
      // check for forced-self drops
      let validSelfDropIndices = [];
      
      for (let i = 0; i < digitRelations.length; i++) {
        let rel = digitRelations[i];
        if (rel[1].length < 2)
          continue;
        
        if (rel[1][0] == segIdx || rel[1][1] == segIdx) {
          validSelfDropIndices.push(rel[1][0]);
          validSelfDropIndices.push(rel[1][1]);
        }
      }

      if (validSelfDropIndices.length > 0) {
        elBtnReset.style.opacity = '1';
        numOfMovesMade++;
        setSegState(seg, false);
        sourceSeg = seg;
        isHoldingStick = true;
        setHeldStickVisible(true);
        forcedDropTarget = digit;
        forcedDropIndices = validSelfDropIndices;
        return true;
      }
      
      return false;
    }
  }		
    
  function toggleSeg(seg) {
    setSegState(seg, !getSegState(seg));
  }
  
  function getSegState(seg) {
    return !seg.classList.contains("seg-off");
  }
  
  function setSegState(seg, isOn) {
    if (isOn)
      seg.classList.remove("seg-off");
    else
      seg.classList.add("seg-off");
  }
  
  function readDigitSegs(digit) {
    const segs = [];
    for (let i = 0; i < 7; i++)
      segs.push(getSegState(digit.children[i]));
    
    for (let i = 0; i <= 9; i++) {
      const segs2 = digitValToSegments[i];
      let equal = true;
      for (let j = 0; equal && j < 7; j++)
        equal = segs[j] == segs2[j];
      if (equal)
        return i;
    }
    
    return -1;
  }
  
  function setDigit(digit, value) {
    const segs = digitValToSegments[value];
    for (let i = 0; i < 7; i++)
      setSegState(digit.children[i], segs[i]);
    return digit;
  }
		
  function validatePuzzleStr(q) {
    if (!q) {
      return;
    }
    let equalOpCount = 0;
    for (let i = 0; i < q.length; i++) {
      const c = q.charAt(i);
      if (!isDigit(c) && getOpName(c) == null) {
        return;
      }
    }
    return evalSides(q)
  }

  function evalSides(q) {
    const idx = q.indexOf('=');
    if (idx == -1)
      return;
      
    let L = q.substring(0, idx);
    let R = q.substring(idx + 1);
    
    // fix division operator
    L = L.replace(':', '/');
    R = R.replace(':', '/');
    
    const sides = [];
    
    try {
      const v = eval(L);
      if (isFinite(v))
        sides.push(v);
      else
        return;
    }
    catch (err) {
      return;
    }

    try {
      const v = eval(R);
      if (isFinite(v))
        sides.push(v);
      else
        return;
    }
    catch (err) {
      return;
    }
  
    return sides;
  }
  
  function isDigit(c) {
    return ('0' <= c && c <= '9');
  }
  
  function getOpName(c) {
    switch (c) {
      case '+':
        return 'plus';
      case '-':
        return 'minus';
      case '*':
        return 'mult';
      case '/':
      case ':':
        return 'division';
      case '=':
        return 'equal';
    }
  }

  function readQuestion() {
    for (let i = 0; i < q.length; i++) {
      const c = q.charAt(i);
      if (isDigit(c))
        setDigit(questionElements[i], parseInt(c));
    }
  }

  function checkAnswer() {
    if (!validateAnswer())
      return;
    
    isSolved = true;
    elBtnReset.value = 'הצלחתם!';
    elBtnReset.classList.add("solved");
    solveCallback();
  }
  
  function validateAnswer() {
    let answer = '';
    for (let i = 0; i < q.length; i++) {
      const c = q.charAt(i);
      if (!isDigit(c)) {
        answer += c;
        continue;
      }
      const digitVal = readDigitSegs(questionElements[i]);
      if (digitVal == -1)
        return false;
      answer += digitVal;
    }
    
    const sides = evalSides(answer);
    return sides[0] == sides[1];
  }

  function updateSize() {
    let w = container.clientWidth;
    let h = container.clientHeight;
    if (w < 100) w = 100;
    if (h < 100) h = 100;
    
    let digW = (h - 20) * 0.25;			
    const altDigW = w / questionWidthFactor;
    if (digW > altDigW) {
      digW = altDigW;
    }
    digW -= digW % 10;
    
    let segPad = digW * 0.025;
    segPad -= segPad % 1;
    if (segPad < 1) {
      segPad = 1;
    }
    
    container.style.setProperty('--digitWidth', digW + 'px');
    container.style.setProperty('--segPad', segPad + 'px');
  }
  
  function init() {
    if (!validatePuzzleStr(q)) {
      console.error('matchsticks got an invalid puzzle string, defaulting to \'3=5\'');
      q = '3=5';
    }
    // Create elements for digits and ops
    for (let i = 0; i < q.length; i++) {
      let c = q.charAt(i);

      if (isDigit(c)) {
        questionElements.push(createDigitElement(subContainer));
        questionWidthFactor += 1.425;
      }
      else {
        questionElements.push(createOperatorElement(getOpName(c), subContainer));
        questionWidthFactor += 1.375;
      }
    }
    resetSticks();
    updateSize();
  }
  
  init();
  return {
    resetSticks,
    updateSize
  };
}

window.createMatchsticks = createMatchsticks;

})()