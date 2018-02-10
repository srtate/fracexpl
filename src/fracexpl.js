/**
 * fracexpl.js - Fractal explorer Javascript component
 * Copyright (C) 2017 Stephen R. Tate
 *
 * Project page: https://github.com/srtate/fracexpl
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 */

function sqr(x) {
  return x*x;
}

function FractalDraw(toolNum, seed, askWidth, askHeight, levels) {
  this.seed = seed;

  this.canvas = document.createElement("canvas");
  this.canvas.id = "ft-drawing-canvas-"+toolNum;
  this.canvas.width = Math.max(640, askWidth);
  this.canvas.height = Math.max(320, askHeight);
  this.canvas.style.cssText = "border:1px solid black; position:absolute; left:0; top:0; z-index: 1;";
  this.ctx = this.canvas.getContext("2d");

  this.ctrlPanel = document.createElement("div");
  this.ctrlPanel.id = "ft-drawing-ctrls-"+toolNum;
  this.ctrlPanel.style.display = "block";

  this.levelButtons = document.createElement("div");
  for (i=1; i<=8; i++) {
    var button = document.createElement("button");
    button.className="btn btn-secondary btn-sm";
    button.style.marginLeft = "4px";
    button.addEventListener("click", function(inum) {
      this.drawIt(inum); }.bind(this,i));
    button.innerHTML = "Iter "+i;
    this.levelButtons.appendChild(button);
  }
  this.currLevels = levels;
  this.ctrlPanel.appendChild(this.levelButtons);

  panelRow = document.createElement("div");
  panelRow.style.marginTop = "10px";
  var thickLabel = document.createElement("span");
  thickLabel.style.marginLeft = "4px";
  thickLabel.innerHTML = "Line Thickness: ";
  panelRow.appendChild(thickLabel);
  this.drawThickness = document.createElement("input");
  this.drawThickness.type = "number";
  this.drawThickness.value = 1;
  this.drawThickness.min = 1;
  this.drawThickness.style.width = "60px";
  this.drawThickness.addEventListener("change", function () {
    if (this.drawThickness.value < 1.0) {
      this.drawThickness.value = 1.0;
    }
    this.drawIt(this.currLevels); }.bind(this));
  panelRow.appendChild(this.drawThickness);
  this.dimInfo = document.createElement("span");
  this.dimInfo.style.marginLeft = "20px";
  this.dimInfo.innerHTML = "Dim=?";
  panelRow.appendChild(this.dimInfo);

  this.ctrlPanel.appendChild(panelRow);

  this.drawWidth = 1;
}

FractalDraw.prototype.checkDim = function(dim) {
  var seed = this.seed;
  if (seed.length < 2) return -1.0;
  var baseline = Math.sqrt((seed[seed.length-1][0]-seed[0][0])**2+
                           (seed[seed.length-1][1]-seed[0][1])**2);
  if (baseline < 1.0) return -1.0;

  var lenSum = 0.0;
  for (var i=1; i<seed.length; i++) {
    var segLen = Math.sqrt((seed[i][0]-seed[i-1][0])**2+
                           (seed[i][1]-seed[i-1][1])**2);
    var linScale = segLen/baseline;
    if (seed[i][2] < 4)
      lenSum += linScale**dim;
  }

  return lenSum;
};

FractalDraw.prototype.getDim = function() {
  var seed = this.seed;
  var replSum = 0.0;
  var nonrepl = 0.0;
  var baseline = Math.sqrt((seed[seed.length-1][0]-seed[0][0])**2+
                           (seed[seed.length-1][1]-seed[0][1])**2);
  if (baseline < 1.0) return -1.0;

  for (var i=1; i<seed.length; i++) {
    var segLen = Math.sqrt((seed[i][0]-seed[i-1][0])**2+
                           (seed[i][1]-seed[i-1][1])**2);
    var linScale = segLen/baseline;
    if (seed[i][2] < 4)
      replSum += linScale;
    else if (seed[i][2] == 4)
      nonrepl += linScale;   // Visible but non-replicating
  }

  if (nonrepl > 0.0) {
    if (replSum < 1.0)
      return 1.0;
    else
      return -1.0;
  }

  if ((nonrepl == 0.0) && (replSum == 0.0))
    return 0.0;

  var lo = 0.0;
  var hi = 2.0;
  var tmp = this.checkDim(lo);
  if (tmp < 1.0) return -1.0;
  tmp = this.checkDim(hi);
  if ((tmp == -1.0) || (tmp > 1.0)) return -1.0;

  while ((hi-lo) > 0.0005) {
    var mid = (lo+hi)/2;
    tmp = this.checkDim(mid);
    if (tmp >= 1.0) lo = mid;
    else hi = mid;
  }

  return (lo+hi)/2;
};

FractalDraw.prototype.setSeed = function(newSeed) {
  this.seed = newSeed;
};

FractalDraw.prototype.setDrawWidth = function(width) {
  this.drawThickness.value = width;
};

FractalDraw.prototype.cloneSeed = function() {
  copy = [];
  for (var i=0; i<this.seed.length; i++)
    copy.push(this.seed[i].slice());
  this.seed = copy;
};

FractalDraw.prototype.addToSeed = function(pt) {
  if ((pt[0] != this.seed[this.seed.length-1][0]) ||
      (pt[1] != this.seed[this.seed.length-1][1])) {
    this.seed.push(pt);
  }
};

FractalDraw.prototype.insertInSeed = function(pt, idx) {
  if ((idx >= 0) && (idx <= this.seed.length)) {
    this.seed.splice(idx, 0, pt);
  }
};

FractalDraw.prototype.deleteFromSeed = function(idx) {
  if ((idx >= 0) && (idx < this.seed.length)) {
    this.seed.splice(idx, 1);
  }
};

FractalDraw.prototype.changeSeedPt = function (ptNum, newPoint) {
  this.seed[ptNum] = newPoint;
};

FractalDraw.prototype.closestPt = function(pt) {
  if (this.seed.length < 1) return -1;
  var cl_idx = 0;
  var cl_distsq = sqr(pt[0]-this.seed[0][0])+sqr(pt[1]-this.seed[0][1]);
  for (var i=1; i<this.seed.length; i++) {
    var distsq = sqr(pt[0]-this.seed[i][0])+sqr(pt[1]-this.seed[i][1]);
    if (distsq < cl_distsq) {
      cl_idx = i;
      cl_distsq = distsq;
    }
  }

  // Tolerance: Must be within 10 pixels...
  if (cl_distsq <= 100.0)
    return cl_idx;
  else
    return -1;
};

function ptlsdist2(pt, e1, e2) {
  if ((e1[0]==e2[0]) && (e1[1] == e2[1]))
    return sqr(pt[0]-e1[0])+(pt[1]-e1[1]);  // shouldn't happen?
  var seglen = sqr(e1[0]-e2[0])+sqr(e1[1]-e2[1]);
  var t = ((pt[0]-e1[0])*(e2[0]-e1[0]) + (pt[1]-e1[1])*(e2[1]-e1[1]))/seglen;
  t = Math.max(0, Math.min(1, t)); // constrain to 0<=t<=1 (on segment)
  var lx = e1[0] + t*(e2[0]-e1[0]);
  var ly = e1[1] + t*(e2[1]-e1[1]);
  return sqr(pt[0]-lx)+sqr(pt[1]-ly);
};

FractalDraw.prototype.closestLn = function(pt) {
  if (this.seed.length < 1) return -1;
  var cl_idx = 0;
  var cl_distsq = ptlsdist2(pt, this.seed[0], this.seed[1]);
  for (var i=1; i<this.seed.length-1; i++) {
    var distsq = ptlsdist2(pt, this.seed[i], this.seed[i+1]);
    if (distsq < cl_distsq) {
      cl_idx = i;
      cl_distsq = distsq;
    }
  }

  // Tolerance: Must be within 5 pixels...
  if (cl_distsq <= 25.0)
    return cl_idx;
  else
    return -1;
};

FractalDraw.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

FractalDraw.prototype.drawIt = function(levels) {
  if (this.currLevels != -1) {
    this.levelButtons.children[this.currLevels-1].disabled = false;
  }
  this.currLevels = levels;
  this.levelButtons.children[levels-1].disabled = true;
  this.clear();
  this.ctx.lineWidth = this.drawThickness.value;
  this.ctx.strokeStyle = "black";
  this.basedraw(this.seed[0], this.seed[this.seed.length-1], 1, levels);
  this.ctx.closePath();
};

FractalDraw.prototype.getCanvas = function() {
  return this.canvas;
};

FractalDraw.prototype.getCtrls = function() {
  return this.ctrlPanel;
};

FractalDraw.prototype.enableMode = function() {
  this.ctrlPanel.style.display = "inline-block";
  this.drawIt(this.currLevels);
  var dim = Math.round(this.getDim()*1000.0)/1000.0;
  if (dim == -1) {
    this.dimInfo.innerHTML = "Dim=?";
  } else {
    this.dimInfo.innerHTML = "Dim="+dim;
  }
};

FractalDraw.prototype.disableMode = function() {
  this.ctrlPanel.style.display = "none";
};

FractalDraw.prototype.drawSeed = function(drawBaseLine=false, without = -1) {
  this.clear();
  if (this.seed.length > 1) {
    for (var i=1; i<this.seed.length; i++) {
      if ((i-1 != without) && (i != without)) {
        this.ctx.beginPath();
        this.ctx.lineWidth = SeedEditor.SegType[this.seed[i][2]].width;
        this.ctx.strokeStyle = SeedEditor.SegType[this.seed[i][2]].color;
        this.ctx.moveTo(this.seed[i-1][0], this.seed[i-1][1]);
        this.ctx.lineTo(this.seed[i][0], this.seed[i][1]);
        this.ctx.stroke();
      }
    }
    if (drawBaseLine) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "black";
      this.ctx.setLineDash([10,10]);
      this.ctx.moveTo(this.seed[0][0], this.seed[0][1]);
      this.ctx.lineTo(this.seed[this.seed.length-1][0],
                      this.seed[this.seed.length-1][1]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }
};

FractalDraw.prototype.basedraw = function(start, end, hflip, level) {
  if (this.seed.length < 2) return;
  var dx = this.seed[this.seed.length-1][0]-this.seed[0][0];
  var dy = this.seed[this.seed.length-1][1]-this.seed[0][1];
  var d = dx*dx + dy*dy;
  var dx1 = end[0]-start[0];
  var dy1 = end[1]-start[1];
  if (dx1*dx1+dy1*dy1 < 1.0) {
    this.ctx.beginPath();
    this.ctx.moveTo(start[0],start[1]);
    this.ctx.lineTo(end[0],end[1]);
    this.ctx.stroke();
    return;
  }
  var a = (dx*dx1 + hflip*dy*dy1)/d;
  var b = (dx1*dy - hflip*dx*dy1)/d;
  var tx = start[0] - a*this.seed[0][0] - b*this.seed[0][1];
  var c = (dx*dy1 - hflip*dy*dx1)/d;
  var d = (dy1*dy + hflip*dx*dx1)/d;
  var ty = start[1] - c*this.seed[0][0] - d*this.seed[0][1];
  var xx = a*this.seed[0][0]+b*this.seed[0][1]+tx;
  var yy = c*this.seed[0][0]+d*this.seed[0][1]+ty;

  for (var i = 1; i<this.seed.length; i++) {
    var xn = a*this.seed[i][0]+b*this.seed[i][1]+tx;
    var yn = c*this.seed[i][0]+d*this.seed[i][1]+ty;
    if (this.seed[i][2] != 5) {
      if ((level == 1) || (this.seed[i][2] == 4)) {
        this.ctx.beginPath();
        this.ctx.moveTo(xx, yy);
        this.ctx.lineTo(xn, yn);
        this.ctx.stroke();
      } else if (this.seed[i][2] == 1) {
        this.basedraw([xx, yy], [xn,yn], -hflip, level-1);
      } else if (this.seed[i][2] == 2) {
        this.basedraw([xn, yn], [xx,yy], -hflip, level-1);
      } else if (this.seed[i][2] == 3) {
        this.basedraw([xn, yn], [xx,yy], hflip, level-1);
      } else {
        this.basedraw([xx,yy], [xn, yn], hflip, level-1);
      }
    }
    xx = xn;
    yy = yn;
  }
};


function SeedEditor (fractalDraw, enabled) {
  this.fractalDraw = fractalDraw;
  var drawingcanvas = fractalDraw.getCanvas();
  var drawingz = parseInt(drawingcanvas.style["z-index"]);
  drawingcanvas.style["z-index"] = drawingz+1;

  this.bgcanvas = document.createElement("canvas");
  this.bgcanvas.id = "fraceditbg";
  this.bgcanvas.width = drawingcanvas.width;
  this.bgcanvas.height = drawingcanvas.height;
  this.bgcanvas.style.cssText = drawingcanvas.style.cssText;
  this.bgcanvas.style["z-index"] = drawingz;
  if (!enabled) {
    this.bgcanvas.style["display"] = "none";
  }
  drawingcanvas.parentElement.appendChild(this.bgcanvas);
  this.setupBackground();

  this.workcanvas = document.createElement("canvas");
  this.workcanvas.id = "fraceditwork";
  this.workcanvas.width = drawingcanvas.width;
  this.workcanvas.height = drawingcanvas.height;
  this.workcanvas.style.cssText = drawingcanvas.style.cssText;
  this.workcanvas.style["z-index"] = drawingz+2;
  if (!enabled) {
    this.workcanvas.style["display"] = "none";
  }
  drawingcanvas.parentElement.appendChild(this.workcanvas);
  this.workctx = this.workcanvas.getContext("2d");
  this.workrect = this.workcanvas.getBoundingClientRect();
  this.workcanvas.seedEditor = this;

  this.gridhighlight = [-1,-1];
  this.workcanvas.onmousemove = this.mouseMove.bind(this);
  this.workcanvas.onclick = this.mouseClick.bind(this);
  this.workcanvas.ondblclick = this.mouseDblClick.bind(this);

  this.workcanvas.tabIndex = 1;
  this.workcanvas.focus();
  this.workcanvas.onkeydown = this.keyPress.bind(this);

  this.editMode = SeedEditor.EDITMODE.INIT;
  this.anchor1 = null;
  this.anchor2 = null;
  this.movePt = -1;

  this.ctrlPanel = document.createElement("div");
  this.ctrlPanel.id = "scoobydoo";
  this.ctrlPanel.style.display = "block";

  var panelTbl = document.createElement("table");
  var panelRow = document.createElement("tr");
  panelTbl.appendChild(panelRow);

  var panelTD = document.createElement("td");
  this.currentSegType = -1;
  this.segTypeBtn = [];
  for (var i=0; i<SeedEditor.SegType.length; i++) {
    var typeBtn = document.createElement("button");
    //  typeBtn.innerHTML = SeedEditor.SegType[i].name;
    typeBtn.innerHTML = "<img src='button"+(i+1)+".png' />";
    typeBtn.className = "btn btn-secondary btn-sm";
    typeBtn.style.marginLeft="4px";
    typeBtn.onclick = function (type) {
      this.setSegType(type); }.bind(this, i);
    this.segTypeBtn.push(typeBtn);
    panelTD.appendChild(typeBtn);
  }
  panelRow.appendChild(panelTD);

  panelRow = document.createElement("tr");
  panelTbl.appendChild(panelRow);
  panelTD = document.createElement("td");
  panelTD.style["padding-top"] = "6px";

  this.stdSeeds = [];
  this.stdSeedWidth = [];
  var pickerLabel = document.createElement("span");
  pickerLabel.innerHTML = "Seed: ";
  panelTD.appendChild(pickerLabel);
  this.picker = document.createElement("select");
  this.picker.type = "list";
  this.picker.onchange = function() {
    this.pickSeed(); }.bind(this);

  panelTD.appendChild(this.picker);
  this.addSeed("edit", "Make your own...", []);

  this.clearBtn = document.createElement("button");
  this.clearBtn.innerHTML = "Clear";
  this.clearBtn.className = "btn btn-secondary btn-sm";
  this.clearBtn.style.marginLeft = "4px";
  this.clearBtn.style.marginRight = "4px";
  this.clearBtn.style.width = "80px";

  this.clearBtn.onclick = function() {
    this.clearBtnClicked(); }.bind(this);
  panelTD.appendChild(this.clearBtn);

  this.snapBox = document.createElement("input");
  this.snapBox.type = "checkbox";
  this.snapBox.checked = true;
  this.snapBox.style.marginLeft = "8px";
  panelTD.appendChild(this.snapBox);

  var snapBoxLabel = document.createElement("span");
  snapBoxLabel.innerHTML = "Snap to grid";
  panelTD.appendChild(snapBoxLabel);

  panelRow.appendChild(panelTD);

  this.ctrlPanel.appendChild(panelTbl);

  this.setSegType(0);
}

SeedEditor.prototype.addSeed = function(name, longname, seed, width) {
  var option = document.createElement("option");
  option.value = name;
  option.dataset["name"] = name;
  option.innerHTML = longname;
  this.stdSeeds.push(seed);
  this.stdSeedWidth.push(width);
  this.picker.appendChild(option);
};

SeedEditor.prototype.addStdSeed = function(name) {
  var seedInfo = SeedEditor.StdSeeds[name];
  if (seedInfo != undefined) {
    // Adjust to JS canvas coordinates - do we need this?
    var adjSeed = [];
    for (var i=0; i<seedInfo.seed.length; i++) {
      adjSeed.push([seedInfo.seed[i][0]+0.5,seedInfo.seed[i][1]+0.5,
                    seedInfo.seed[i][2]]);
    }
    // Nudging thickness here, because I like the narrower lines...
    var thickness = Math.max(seedInfo.thickness-1,1);
    this.addSeed(name, seedInfo.fullname, adjSeed, thickness);
  }
};

SeedEditor.prototype.setSeedByName = function(seedName) {
  var findName = seedName.toLowerCase();
  var seeds = this.picker.children;
  for (var i=0; i<seeds.length; i++) {
    if (findName == seeds[i].dataset["name"]) {
      this.picker.selectedIndex = i;
      this.pickSeed();
      return;
    }
  }
};

SeedEditor.prototype.pickSeed = function() {
  this.reset();
  if (this.picker.selectedIndex != 0) {
    this.fractalDraw.setSeed(this.stdSeeds[this.picker.selectedIndex]);
    this.fractalDraw.setDrawWidth(this.stdSeedWidth[this.picker.selectedIndex]);
    this.clearWork();
    this.setMode(SeedEditor.EDITMODE.LOCKED);
  }
  this.fractalDraw.drawSeed(true);
};

SeedEditor.prototype.clearBtnClicked = function() {
  if (this.editMode == SeedEditor.EDITMODE.LOCKED) {
    this.picker.selectedIndex = 0;
    this.setMode(SeedEditor.EDITMODE.DONE);
  }
  this.reset();
  this.fractalDraw.drawSeed(true);
};

SeedEditor.prototype.getCtrls = function() {
  return this.ctrlPanel;
};

SeedEditor.prototype.setSegType = function(type) {
  if (type != this.currentSegType) {
    if (this.currentSegType != -1) {
      this.segTypeBtn[this.currentSegType].disabled = false;
    }
    this.segTypeBtn[type].disabled = true;
    this.currentSegType = type;

    if (this.anchor1 != null) {
      this.anchor1[2] = type;
      this.drawWork();
    }
  }
};

SeedEditor.SegType = [
  {
    name: "Reg",
    color: "#e41a1c",
    width: 2
  },{
    name: "Flip",
    color: "#377eb8",
    width: 2
  },{
    name: "Disabled1",
    color: "#ff7f00",
    width: 2
  },{
    name: "Disabled2",
    color: "#984ea3",
    width: 2
  },{
    name: "No Recurse",
    color: "#4daf4a",
    width: 2
  },{
    name: "No Line",
    color: "#808080",
    width: 1
  }
];

SeedEditor.EDITMODE = {
  INIT : 0,
  DEFINING : 1,
  DONE: 2,
  MOVEPT : 3,
  LOCKED : 4
};

SeedEditor.prototype.setupBackground = function() {
  var bgctx = this.bgcanvas.getContext("2d");
  bgctx.strokeStyle = "#a0a0a0";
  bgctx.lineWidth = 1;
  // center is (20.5,20.5) - go 18-23
  for (var x = 1; x < Math.floor(this.bgcanvas.width/20); x++) {
    for (var y = 1; y < Math.floor(this.bgcanvas.height/20); y++) {
      bgctx.beginPath();
      bgctx.moveTo(x*20-2,y*20+0.5);
      bgctx.lineTo(x*20+3,y*20+0.5);
      bgctx.moveTo(x*20+0.5,y*20-2);
      bgctx.lineTo(x*20+0.5,y*20+3);
      bgctx.stroke();
    }
  }
};

SeedEditor.prototype.enableMode = function() {
  this.bgcanvas.style.display = "inline";
  this.workcanvas.style.display = "inline";
  this.ctrlPanel.style.display = "inline-block";
  if ((this.editMode == SeedEditor.EDITMODE.DONE) ||
      (this.editMode == SeedEditor.EDITMODE.LOCKED))
    this.fractalDraw.drawSeed(true);
  else
    this.fractalDraw.drawSeed(false);
};

SeedEditor.prototype.disableMode = function() {
  this.bgcanvas.style.display = "none";
  this.workcanvas.style.display = "none";
  this.ctrlPanel.style.display = "none";
};

SeedEditor.prototype.reset = function() {
  this.setMode(SeedEditor.EDITMODE.INIT);
  this.anchor1 = null;
  this.anchor2 = null;
  this.fractalDraw.setSeed([]);
  this.fractalDraw.setDrawWidth(1);
};

SeedEditor.prototype.drawWork = function() {
  this.clearWork();
  if (this.anchor1 != null) {
    this.workctx.beginPath();
    this.workctx.strokeStyle = SeedEditor.SegType[this.anchor1[2]].color;
    this.workctx.moveTo(this.anchor1[0],this.anchor1[1]);
    this.workctx.lineTo(this.mouseX, this.mouseY)
    this.workctx.stroke();
  }
  if (this.anchor2 != null) {
    this.workctx.beginPath();
    this.workctx.strokeStyle = SeedEditor.SegType[this.anchor2[2]].color;
    this.workctx.moveTo(this.anchor2[0],this.anchor2[1]);
    this.workctx.lineTo(this.mouseX, this.mouseY)
    this.workctx.stroke();
  }

  if ((this.gridhighlight[0] != -1) && (this.gridhighlight[1] != -1)) {
    this.workctx.beginPath();
    this.workctx.arc(this.gridhighlight[0], this.gridhighlight[1], 3.5, 0, 6.28);
    this.workctx.fill();
  }
};

SeedEditor.prototype.editCopy = function() {
  this.fractalDraw.cloneSeed();
  this.anchor1 = null;
  this.anchor2 = null;
  this.setMode(SeedEditor.EDITMODE.DONE);
};

SeedEditor.prototype.setMode = function(mode) {
  this.editMode = mode;
};

SeedEditor.prototype.clearWork = function() {
  this.workctx.clearRect(0, 0, this.workcanvas.width, this.workcanvas.height);
};

SeedEditor.prototype.getMousePos = function(evt) {
  this.rawX = evt.clientX - this.workrect.left;
  this.rawY = evt.clientY - this.workrect.top;
  if (this.snapBox.checked) {
    this.mouseX = 20*Math.round(this.rawX/20.0)+0.5;
    this.mouseY = 20*Math.round(this.rawY/20.0)+0.5;
  } else {
    this.mouseX = this.rawX;
    this.mouseY = this.rawY;
  }
};

SeedEditor.prototype.mouseMove = function(evt) {
  if ((this.editMode == SeedEditor.EDITMODE.DONE) ||
      (this.editMode == SeedEditor.EDITMODE.LOCKED))
    return;

  this.getMousePos(evt);
  if ((this.mouseX != this.gridhighlight[0]) ||
      (this.mouseY != this.gridhighlight[1])) {
    this.gridhighlight = [this.mouseX, this.mouseY];
    this.drawWork();
  }
};

SeedEditor.prototype.mouseClick = function (evt) {
  var seed = this.fractalDraw.seed; // Better way to do this?
  this.getMousePos(evt);
  if (this.editMode == SeedEditor.EDITMODE.DEFINING) {
    this.fractalDraw.addToSeed([this.mouseX,this.mouseY,this.currentSegType]);
    this.fractalDraw.drawSeed(false);
    this.anchor1 = [this.mouseX,this.mouseY,this.currentSegType];
  } else if (this.editMode == SeedEditor.EDITMODE.INIT) {
    this.fractalDraw.setSeed([ [this.mouseX,this.mouseY,0] ]);
    this.anchor1 = [this.mouseX,this.mouseY,this.currentSegType];
    this.setMode(SeedEditor.EDITMODE.DEFINING);
  } else if ((this.editMode == SeedEditor.EDITMODE.DONE) ||
             (this.editMode == SeedEditor.EDITMODE.LOCKED)) {
    if (this.editMode == SeedEditor.EDITMODE.LOCKED) {
      this.editCopy();
      this.picker.selectedIndex = 0;
      this.setMode(SeedEditor.EDITMODE.DONE);
    }

    var closest_pt = this.fractalDraw.closestPt([this.rawX,this.rawY]);
    if (closest_pt >= 0) {
      if (closest_pt == 0) {
        this.anchor1 = [seed[1][0],seed[1][1],seed[1][2]];
      } else {
        this.anchor1 = [seed[closest_pt-1][0],seed[closest_pt-1][1],seed[closest_pt][2]];
        if (closest_pt < seed.length-1)
          this.anchor2 = [seed[closest_pt+1][0],seed[closest_pt+1][1],seed[closest_pt+1][2]];
      }
      this.movePt = closest_pt;
      this.fractalDraw.drawSeed(false,this.movePt);
      this.gridhighlight = [this.mouseX,this.mouseY];
      this.drawWork();
      this.setMode(SeedEditor.EDITMODE.MOVEPT);
    } else {
      var closest_ln = this.fractalDraw.closestLn([this.rawX,this.rawY]);
      if (closest_ln >= 0) {
        seed[closest_ln+1][2] = this.currentSegType;
        this.fractalDraw.drawSeed(true);
      }
    }
  } else if (this.editMode == SeedEditor.EDITMODE.MOVEPT) {
    if (this.movePt >= 0) {
      this.fractalDraw.changeSeedPt(this.movePt,
                                    [this.mouseX, this.mouseY, this.anchor1[2]]);
      this.fractalDraw.clear();
      this.fractalDraw.drawSeed(true);
      this.clearWork();
      this.setMode(SeedEditor.EDITMODE.DONE);
      this.movePt = -1;
      this.anchor1 = this.anchor2 = null;
    }
  }
};

SeedEditor.prototype.keyPress = function (evt) {
  var charCode = evt.keyCode || evt.which;
  if ((charCode == 46) || (charCode == 8)) {
    // Delete (or backspace)
    if ((this.editMode == SeedEditor.EDITMODE.MOVEPT) && (this.fractalDraw.seed.length > 2)) {
      this.fractalDraw.deleteFromSeed(this.movePt);
      this.fractalDraw.clear();
      this.fractalDraw.drawSeed(true);
      this.clearWork();
      this.setMode(SeedEditor.EDITMODE.DONE);
      this.movePt = -1;
      this.anchor1 = this.anchor2 = null;
    }
  }
};

SeedEditor.prototype.mouseDblClick = function (evt) {
  if (this.editMode == SeedEditor.EDITMODE.DEFINING) {
    this.getMousePos(evt);
    this.fractalDraw.addToSeed([this.mouseX,this.mouseY,this.currentSegType]);
    this.fractalDraw.clear();
    this.fractalDraw.drawSeed(true);
    this.clearWork();
    this.anchor1 = this.anchor2 = null;
    this.setMode(SeedEditor.EDITMODE.DONE);
  } else if (this.editMode == SeedEditor.EDITMODE.DONE) {
    var closest_pt = this.fractalDraw.closestPt([this.rawX,this.rawY]);
    var closest_ln = this.fractalDraw.closestLn([this.rawX,this.rawY]);
    var seed = this.fractalDraw.seed;
    if ((closest_pt == -1) && (closest_ln >= 0)) {
      this.fractalDraw.insertInSeed([this.mouseX,this.mouseY,seed[closest_ln+1][2]], closest_ln+1);

      this.anchor1 = seed[closest_ln].slice();
      this.anchor2 = seed[closest_ln+2].slice();
      this.anchor1[2] = this.anchor2[2];
      this.movePt = closest_ln+1;
      this.fractalDraw.drawSeed(false,this.movePt);
      this.gridhighlight = [this.mouseX,this.mouseY];
      this.drawWork();
      this.setMode(SeedEditor.EDITMODE.MOVEPT);
    }
  }
};

SeedEditor.StdSeeds = {
  "3crosses": {
    fullname: "Three Crosses",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[260.0,180.0,0],[280.0,220.0,5],[260.0,120.0,5],
           [260.0,20.0,4],[380.0,20.0,4],[380.0,120.0,4],[480.0,120.0,4],
           [480.0,220.0,4],[380.0,220.0,4],[380.0,300.0,4],
           [380.0,320.0,4],[260.0,320.0,4],[260.0,220.0,4],
           [160.0,220.0,4],[160.0,120.0,4],[260.0,120.0,4],
           [300.0,180.0,5],[340.0,180.0,0],[380.0,180.0,5]]
  },
  "baila": {
    fullname: "Ba-ila",
    thickness: 2.0,
    thicknessType: 1,
    itNumber: 3,
    seed: [[210.0,284.0,0],[210.0,187.07369995117188,5],
           [210.0,200.80044555664062,4],
           [216.86341857910156,221.39060974121094,4],
           [223.726806640625,235.117431640625,0],
           [237.4535369873047,248.84420776367188,0],
           [251.1803436279297,262.5709533691406,0],
           [278.6339111328125,269.434326171875,0],
           [312.9508361816406,276.2977294921875,0],
           [354.13116455078125,276.2977294921875,0],
           [395.3115234375,269.434326171875,0],
           [429.6284484863281,248.84420776367188,0],
           [457.0820617675781,215.213623046875,0],
           [469.4361877441406,171.97422790527344,0],
           [469.4361877441406,122.55779266357422,0],
           [450.9050598144531,85.49552154541016,0],
           [420.01971435546875,60.787296295166016,0],
           [389.1344909667969,48.43317794799805,0],
           [358.2492370605469,42.25618362426758,0],
           [327.36395263671875,42.25618362426758,0],
           [296.47869873046875,48.43317794799805,0],
           [271.7704772949219,60.787296295166016,0],
           [253.23934936523438,73.14141845703125,0],
           [234.7082061767578,85.49552154541016,0],
           [222.3541259765625,97.8495864868164,0],
           [216.1770477294922,110.2037124633789,0],
           [210.0,128.73486328125,4],[210.0,139.0299072265625,4],
           [374.7213439941406,180.21029663085938,5],
           [374.7213439941406,118.43974304199219,0],
           [210.0,32.34235382080078,5]]
  },
  "blanket": {
    fullname: "Fulani blanket",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[240.0,160.0,0],[170.0,160.0,5],[130.0,220.0,4],
           [90.0,160.0,4],[130.0,100.0,4],[170.0,160.0,4],[50.0,100.0,5],
           [10.0,160.0,4],[50.0,220.0,4],[90.0,160.0,4],[50.0,100.0,4],
           [280.0,120.0,5],[330.0,120.0,0],[280.0,200.0,5],
           [330.0,200.0,0],[430.0,160.0,5],[470.0,220.0,4],
           [510.0,160.0,4],[550.0,220.0,4],[590.0,160.0,4],
           [550.0,100.0,4],[510.0,160.0,4],[470.0,100.0,4],
           [430.0,160.0,4],[360.0,160.0,5]]
  },
  "bullhorn": {
    fullname: "Ghanian bull horn",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 4,
    seed: [[220.0,200.0,0],[255.0,170.0,5],[270.0,180.0,4],
           [296.0,198.0,4],[300.0,206.0,4],[298.0,219.0,4],
           [291.0,230.0,4],[277.0,234.0,4],[265.0,232.0,4],
           [254.0,229.0,4],[242.0,221.0,4],[228.0,208.0,4],
           [222.0,200.0,4],[215.0,183.0,4],[210.0,170.0,4],
           [209.0,154.0,4],[244.0,156.0,0],[255.0,170.0,4],
           [220.0,200.0,5],[258.0,171.0,5]]
  },
  "cantorpaper": {
    fullname: "cantorpaper",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[220.0,161.0,0],[240.0,81.0,5],[260.0,81.0,5],[320.0,81.0,0],
           [340.0,81.0,5],[240.0,81.0,4],[360.0,161.0,5],[220.0,161.0,4],
           [260.0,241.0,5],[320.0,241.0,0],[340.0,241.0,5],
           [240.0,241.0,4],[360.0,161.0,5]]
  },
  "carpet": {
    fullname: "Sierpinski Carpet",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[200.0,300.0,0],[238.58258056640625,197.11302185058594,5],
           [238.58258056640625,94.22604370117188,4],
           [341.4696044921875,94.22604370117188,4],
           [341.4696044921875,197.11302185058594,4],
           [238.58258056640625,197.11302185058594,4],
           [252.06201171875,194.14932250976562,5],
           [238.58258056640625,197.11302185058594,5],
           [238.58258056640625,158.53041076660156,0],
           [238.58258056640625,132.80865478515625,5],
           [238.58258056640625,94.22604370117188,0],
           [277.16522216796875,94.22604370117188,0],
           [302.8869934082031,94.22604370117188,5],
           [341.4696044921875,94.22604370117188,0],
           [341.4696044921875,132.80865478515625,0],
           [341.4696044921875,158.53041076660156,5],
           [341.4696044921875,197.11302185058594,0],
           [302.8869934082031,197.11302185058594,0],
           [277.16522216796875,197.11302185058594,5],
           [238.58258056640625,197.11302185058594,0],
           [380.0522155761719,300.0,5]]
  },
  "chaetophora": {
    fullname: "Chaetophora",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 5,
    seed: [[249.0,322.0,0],[254.1637420654297,319.21954345703125,5],
           [264.9272766113281,245.37684631347656,4],
           [243.8362274169922,319.21954345703125,5],
           [252.0132598876953,246.23777770996094,4],
           [255.02651977539062,244.9463653564453,5],
           [236.23672485351562,184.3251953125,1],
           [207.3065948486328,245.58892822265625,5],
           [261.4835510253906,245.37684631347656,5],
           [286.0102233886719,194.520263671875,0],
           [309.412841796875,245.58892822265625,5],
           [258.3596496582031,245.58892822265625,5]]
  },
  "cnegative": {
    fullname: "Negative Feedback",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 1,
    seed: [[340.0,80.0,0],[320.0,80.0,0],[300.0,80.0,0],[280.0,80.0,0],
           [260.0,80.0,0],[240.0,100.0,0],[240.0,120.0,0],
           [240.0,140.0,0],[240.0,160.0,0],[240.0,180.0,0],
           [240.0,200.0,0],[240.0,220.0,0],[260.0,240.0,0],
           [280.0,240.0,0],[300.0,240.0,0],[320.0,240.0,0],
           [340.0,240.0,0]]
  },
  "cpositive": {
    fullname: "Positive Feedback",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 1,
    seed: [[340.0,100.0,0],[240.0,160.0,0],[340.0,240.0,0]]
  },
  "davincitree2": {
    fullname: "Davinci Tree 2",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 2,
    seed: [[240.0,320.0,0],[240.0,320.0,5],[240.0,230.0,4],
           [260.0,210.0,0],[270.0,210.0,4],[290.0,230.0,0],
           [290.0,320.0,4],[290.0,320.0,5]]
  },
  "davincitree3": {
    fullname: "Davinci Tree 3",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 2,
    seed: [[240.0,320.0,0],[240.0,320.0,5],[240.0,230.0,4],
           [253.0,211.0,0],[277.0,211.0,0],[290.0,230.0,0],
           [290.0,320.0,4],[290.0,320.0,5]]
  },
  "davincitree4": {
    fullname: "Davinci Tree 4",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 2,
    seed: [[240.0,320.0,0],[240.0,320.0,5],[240.0,232.24789428710938,4],
           [246.3679962158203,213.5637969970703,0],
           [264.8714294433594,206.16534423828125,0],
           [283.6661376953125,214.4735107421875,0],
           [288.75115966796875,232.24789428710938,0],
           [288.75115966796875,320.0,4],[288.75115966796875,320.0,5]]
  },
  "dendrite": {
    fullname: "Dendrite",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 4,
    seed: [[260.0,288.0,0],[260.0,240.0,4],[300.0,200.0,5],
           [260.0,240.0,5],[260.0,200.0,1],[260.0,186.0,1],
           [236.0,228.0,5],[183.0,270.0,5],[227.0,220.0,5],
           [260.0,240.0,4],[236.85000610351562,170.38999938964844,5],
           [209.30999755859375,228.70999145507812,5],[260.0,240.0,5],
           [280.0,231.0,4],[300.0,220.0,0],
           [306.510009765625,228.70999145507812,5],[380.0,240.0,5],
           [260.0,240.0,5]]
  },
  "ethiopian2": {
    fullname: "Ethiopian cross 2",
    thickness: 4.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[461.0,160.0,0],[261.0,161.0,5],[341.0,81.0,0],[341.0,20.0,0],
           [341.0,81.0,5],[421.0,161.0,0],[481.0,161.0,0],
           [421.0,161.0,5],[341.0,241.0,0],[341.0,300.0,0],
           [341.0,241.0,5],[261.0,161.0,0],[200.0,161.0,0],
           [221.0,160.0,5]]
  },
  "ethiopian": {
    fullname: "Ethiopian cross 1",
    thickness: 4.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[460.0,181.0,0],[260.0,181.0,5],[340.0,101.0,0],
           [340.0,61.0,0],[340.0,101.0,5],[420.0,181.0,0],
           [460.0,181.0,0],[420.0,181.0,5],[340.0,261.0,0],
           [340.0,301.0,0],[340.0,261.0,5],[260.0,181.0,0],
           [220.0,181.0,0],[220.0,181.0,5]]
  },
  "fern": {
    fullname: "Fern",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 9,
    seed: [[100.0,238.0,0],[100.0,238.0,5],[200.0,158.0,4],
           [280.0,38.0,0],[200.0,158.0,5],[500.0,138.0,0],
           [200.0,158.0,5],[340.0,278.0,0],[500.0,138.0,5]]
  },
  "fractalspirals": {
    fullname: "fractalspirals",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 9,
    seed: [[280.0,280.0,0],[180.0,280.0,5],[180.0,180.0,4],
           [260.0,180.0,5],[320.0,100.0,5],[360.0,180.0,0],
           [320.0,180.0,5],[260.0,180.0,5]]
  },
  "ghanahorns": {
    fullname: "ghanahorns",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 9,
    seed: [[367.0,262.0,0],[418.2435302734375,218.07699584960938,5],
           [440.2049865722656,232.71800231933594,4],
           [478.2716369628906,259.07177734375,4],
           [484.12799072265625,270.78460693359375,4],
           [481.19976806640625,289.8179016113281,4],
           [470.95111083984375,305.9230041503906,4],
           [450.4537048339844,311.77935791015625,4],
           [432.884521484375,308.8511962890625,4],
           [416.77935791015625,304.4588928222656,4],
           [399.2102355957031,292.74609375,4],
           [378.7127685546875,273.71282958984375,4],
           [369.92822265625,262.0,4],
           [359.67950439453125,237.11032104492188,4],
           [352.3590087890625,218.07699584960938,4],
           [350.8948974609375,194.65139770507812,4],
           [425.5639953613281,174.15399169921875,0],
           [418.2435302734375,218.07699584960938,4],[367.0,262.0,5],
           [454.84600830078125,262.0,5]]
  },
  "goldenrec": {
    fullname: "Golden Rectangle",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 8,
    seed: [[304.0,174.0,0],[304.0,174.0,5],[304.0,156.4929656982422,4],
           [328.07220458984375,156.4929656982422,4],
           [328.07220458984375,174.0,4],[304.0,174.0,0],
           [304.0,156.4929656982422,5]]
  },
  "kitwe": {
    fullname: "Kitwe",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[261.0,240.0,0],[241.0,200.0,5],[261.0,160.0,0],
           [321.0,160.0,4],[341.0,200.0,0],[321.0,240.0,4],
           [261.0,240.0,4],[241.0,200.0,4],
           [269.44482421875,202.2428436279297,5],[321.0,240.0,5]]
  },
  "koch": {
    fullname: "Koch Curve",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 1,
    seed: [[60.0,280.0,0],[200.0,280.0,0],[320.0,140.0,0],
           [440.0,280.0,0],[580.0,280.0,0]]
  },
  "kochsmall": {
    fullname: "Small Koch Curve",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 1,
    seed: [[180.5,240.5,0],[260.5,240.5,0],[320.5,160.5,0],
           [380.5,240.5,0],[460.5,240.5,0]]
  },
  "logone": {
    fullname: "Logone",
    thickness: 4.0,
    thicknessType: 0,
    itNumber: 3,
    seed: [[380.0,300.0,0],[180.0,300.0,5],[180.0,200.0,4],
           [180.0,100.0,2],[180.0,60.0,4],[280.0,60.0,4],[380.0,60.0,2],
           [380.0,120.0,4],[380.0,220.0,2],[380.0,300.0,4],
           [320.0,300.0,4],[220.0,300.0,2],[180.0,300.0,4],
           [180.0,300.0,5]]
  },
  "lungs": {
    fullname: "Human Lungs",
    thickness: 8.0,
    thicknessType: 1,
    itNumber: 8,
    seed: [[320.0,90.0,0],[320.0,190.0,4],[250.0,200.0,0],
           [320.0,190.0,5],[380.0,200.0,0],[320.0,190.0,5]]
  },
  "mokoulek": {
    fullname: "Mokoulek",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 4,
    seed: [[420.0,120.0,0],[400.0,120.0,5],[380.0,140.0,4],
           [360.0,180.0,4],[360.0,220.0,4],[380.0,260.0,4],
           [400.0,280.0,4],[440.0,300.0,4],[480.0,300.0,4],
           [520.0,280.0,4],[540.0,260.0,4],[560.0,220.0,4],
           [560.0,180.0,4],[540.0,140.0,4],[520.0,120.0,4],
           [480.0,100.0,4],[440.0,100.0,4],[400.0,120.0,4],
           [420.0,160.0,5],[400.0,180.0,1],[400.0,220.0,5],
           [420.0,240.0,1],[480.0,260.0,5],[500.0,240.0,1],
           [520.0,220.0,5],[520.0,200.0,1],[520.0,180.0,5],
           [520.0,160.0,1],[480.0,160.0,5],[460.0,160.0,1],
           [440.0,180.0,5],[440.0,200.0,1],[440.0,220.0,5],
           [460.0,220.0,1],[480.0,220.0,5],[480.0,200.0,1],
           [240.0,220.0,5],[260.0,100.0,0],[240.0,100.0,5]]
  },
  "nankani": {
    fullname: "Nankani",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 5,
    seed: [[421.0,101.0,0],[350.9679870605469,54.74000549316406,5],
           [337.84600830078125,67.86199951171875,4],
           [324.7239990234375,94.10599517822266,4],
           [324.7239990234375,120.35000610351562,4],
           [337.84600830078125,146.593994140625,4],
           [350.9679870605469,159.71600341796875,4],
           [377.2120361328125,172.8380126953125,4],
           [403.45599365234375,172.8380126953125,4],
           [429.70001220703125,159.71600341796875,4],
           [442.822021484375,146.593994140625,4],
           [455.94403076171875,120.35000610351562,4],
           [455.94403076171875,94.10599517822266,4],
           [442.822021484375,67.86199951171875,4],
           [429.70001220703125,54.74000549316406,4],
           [403.45599365234375,41.618003845214844,4],
           [377.2120361328125,41.618003845214844,4],
           [350.9679870605469,54.74000549316406,4],[272.0,82.0,5],
           [263.0,170.0,0],[211.0,121.97000122070312,5],[329.0,173.0,5]]
  },
  "negative": {
    fullname: "negative",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 1,
    seed: [[340.0,80.0,0],[320.0,80.0,0],[300.0,80.0,0],[280.0,80.0,0],
           [260.0,80.0,0],[240.0,100.0,0],[240.0,120.0,0],
           [240.0,140.0,0],[240.0,160.0,0],[240.0,180.0,0],
           [240.0,200.0,0],[240.0,220.0,0],[260.0,240.0,0],
           [280.0,240.0,0],[300.0,240.0,0],[320.0,240.0,0],
           [340.0,240.0,0]]
  },
  "neuron": {
    fullname: "Neuron",
    thickness: 5.0,
    thicknessType: 1,
    itNumber: 3,
    seed: [[308.0,269.0,0],[282.0,227.0,4],[245.0,153.0,4],
           [195.0,154.0,0],[314.0,173.0,5],[320.0,110.0,0],
           [266.0,194.0,5],[266.0,144.0,0],[282.0,227.0,5],
           [316.0,174.0,4],[369.0,178.0,0],[192.0,157.0,5],
           [309.0,271.0,5],[307.0,278.0,4],[312.0,281.0,4],
           [313.0,276.0,4],[307.0,269.0,4],[264.0,190.0,5],
           [213.0,243.0,0],[242.0,152.0,5],[202.0,108.0,0],
           [142.0,107.0,5],[242.0,147.0,5]]
  },
  "positive": {
    fullname: "positive",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 1,
    seed: [[320.0,100.0,0],[220.0,160.0,0],[320.0,220.0,0]]
  },
  "queenanne": {
    fullname: "Queen Anne's Lace",
    thickness: 2.0,
    thicknessType: 1,
    itNumber: 5,
    seed: [[260.0,320.0,0],[270.0,310.0,4],[280.0,290.0,4],
           [280.0,260.0,4],[270.0,240.0,4],[260.0,220.0,4],
           [220.0,200.0,1],[170.0,170.0,5],[190.0,160.0,5],
           [260.0,220.0,5],[240.0,180.0,1],[360.0,140.0,5],
           [260.0,220.0,5],[280.0,180.0,0],[140.0,130.0,5],
           [180.0,280.0,5],[180.0,220.0,5],[260.0,220.0,5],
           [300.0,200.0,0],[306.510009765625,228.70999145507812,5],
           [260.0,220.0,5]]
  },
  "riverbasin": {
    fullname: "River Basin",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 8,
    seed: [[76.0,260.0,0],[76.0,260.0,5],[270.0,260.0,0],
           [288.2153015136719,24.205242156982422,0],[300.0,260.0,0],
           [547.5895385742188,260.0,0],[547.5895385742188,260.0,5]]
  },
  "sierpinski": {
    fullname: "Sierpinski Triangle",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 5,
    seed: [[398.0,260.0,0],[200.0,260.0,5],[398.0,260.0,4],
           [299.989990234375,81.80000305175781,4],
           [348.5,170.89999389648438,5],[249.5,170.89999389648438,0],
           [299.0,260.0,4],[348.5,170.89999389648438,4],[398.0,260.0,5],
           [299.0,260.0,0],[299.0,260.0,5],[200.0,260.0,0],
           [200.0,260.0,5],[299.989990234375,81.80000305175781,4],
           [200.0,260.0,5]]
  },
  "sprout": {
    fullname: "Sprout",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 9,
    seed: [[260.0,320.0,0],[260.0,180.0,4],[260.0,180.0,5],
           [260.0,180.0,0],[340.0,120.0,0],[320.0,180.0,5],
           [260.0,180.0,5]]
  },
  "turbulence": {
    fullname: "Turbulence",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 9,
    seed: [[293.0,99.0,0],[356.0,107.0999984741211,5],
           [235.12611389160156,87.42520141601562,0],
           [177.2521514892578,99.0,5],
           [154.1025848388672,133.72434997558594,5],
           [177.2521514892578,168.44869995117188,0]]
  },
  "villi": {
    fullname: "Intestinal Villi",
    thickness: 2.0,
    thicknessType: 0,
    itNumber: 2,
    seed: [[80.0,180.0,0],[120.0,180.0,0],[150.0,160.0,0],
           [160.0,120.0,0],[170.0,80.0,0],[180.0,60.0,0],[200.0,60.0,0],
           [220.0,70.0,0],[230.0,90.0,0],[230.0,110.0,0],[240.0,140.0,0],
           [250.0,160.0,0],[270.0,180.0,0],[300.0,180.0,0],
           [310.0,160.0,0],[310.0,130.0,0],[320.0,100.0,0],
           [340.0,90.0,0],[360.0,100.0,0],[370.0,120.0,0],
           [380.0,140.0,0],[390.0,160.0,0],[400.0,170.0,0],
           [430.0,180.0,0],[460.0,170.0,0],[470.0,130.0,0],
           [480.0,110.0,0],[490.0,110.0,0],[500.0,120.0,0],
           [510.0,140.0,0],[510.0,160.0,0],[520.0,170.0,0],
           [540.0,180.0,0]]
  },
  "sharkfin": {
    fullname: "Shark Fin",
    seed: [[200.0,260.0,0],[280.0,260.0,0],[380.0,200.0,4],
           [380.0,260.0,4],[460.0,260.0,4]]
  }
};


function MultiModeTool(mainDiv, toolNum, askWidth, askHeight) {
  this.mainDiv = mainDiv;
  this.toolNum = toolNum;
  this.modes = [];
  this.modeButtons = [];
  this.currentMode = -1;

  this.width = 800;
  if (mainDiv.dataset["width"] != undefined) {
    this.width = Math.max(640, mainDiv.dataset["width"]);
  }

  this.height = 600;
  if (mainDiv.dataset["height"] != undefined) {
    this.height = Math.max(320, mainDiv.dataset["height"]);
  }


  this.canvasDiv = document.createElement("div");
  this.canvasDiv.id = "ft-canvases-"+toolNum;
  this.canvasDiv.style.position = "relative";
  this.canvasDiv.style.height = (this.height + 4) + "px";
  mainDiv.appendChild(this.canvasDiv);

  this.modeSelDiv = document.createElement("div");
  this.modeSelDiv.id = "ft-modesel-"+toolNum;
  this.modeSelDiv.style.display = "inline-block";
  this.modeSelDiv.style["vertical-align"] = "top";
  this.modeSelDiv.style.paddingRight = "10px";
  this.modeSelDiv.style.marginRight = "10px";
  this.modeSelDiv.style.borderRight = "2px solid gray";
  mainDiv.appendChild(this.modeSelDiv);

  this.ctrlPanelDiv = document.createElement("div");
  this.ctrlPanelDiv.id = "ft-ctrlpanel-"+toolNum;
  this.ctrlPanelDiv.style.display = "inline";
  mainDiv.appendChild(this.ctrlPanelDiv);

  var levels = 1;
  if (mainDiv.dataset["levels"] != undefined) {
    levels = mainDiv.dataset["levels"];
  }

  this.drawDiv = new FractalDraw(toolNum, [], this.width, this.height, levels);
  this.canvasDiv.appendChild(this.drawDiv.getCanvas());
  this.addMode("Draw Mode", this.drawDiv);
  this.drawDiv.disableMode();

  this.editorDiv = new SeedEditor(this.drawDiv, true);
  this.addMode("Edit Mode", this.editorDiv);
  this.editorDiv.disableMode();

  var seedlist = "koch,sprout,tree";
  if (mainDiv.dataset["seedlist"] != undefined)
    seedlist = mainDiv.dataset["seedlist"];
  var stdseeds = seedlist.split(",");
  for (var i=0; i<stdseeds.length; i++)
    this.editorDiv.addStdSeed(stdseeds[i]);

  if (mainDiv.dataset["seed"] != undefined) {
    this.editorDiv.setSeedByName(mainDiv.dataset["seed"]);
  }

  var mode = 1;
  if ((mainDiv.dataset["mode"] != undefined) &&
      (mainDiv.dataset["mode"].toLowerCase() == "draw")) {
    mode = 0;
  }

  this.setMode(mode);
}

MultiModeTool.prototype.addMode = function(title, modeObj) {
  var button = document.createElement("button");
  button.innerHTML = title;
  button.className = "btn btn-secondary btn-sm";
  button.style.marginLeft = "4px";
  button.onclick = function(modeNum) {
    this.setMode(modeNum); }.bind(this, this.modes.length);
  this.modeSelDiv.appendChild(button);
  modeObj.disableMode();
  this.ctrlPanelDiv.appendChild(modeObj.getCtrls());
  this.modes.push(modeObj);
  this.modeButtons.push(button);
}

MultiModeTool.prototype.setMode = function(modeNum) {
  if (modeNum != this.currentMode) {
    if (this.currentMode != -1) {
      this.modes[this.currentMode].disableMode();
      this.modeButtons[this.currentMode].disabled = false;
    }
    this.modes[modeNum].enableMode();
    this.modeButtons[modeNum].disabled = true;
    this.currentMode = modeNum;
  }
};

var fractaltool_instances = null;

function fractaltool_init() {
  var tools = document.getElementsByClassName("fractaltool");
  fractaltool_instances = [];
  for (var i=0; i<tools.length; i++) {
    fractaltool_instances[i] = new MultiModeTool(tools[i], i+1, 800, 600);
  }
}

window.addEventListener("load", function (evt) { fractaltool_init(); });

// Local Variables:
// mode: js
// js-indent-level: 2
// End:
