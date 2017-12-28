# fracexpl - JavaScript Fractal Explorer

This repository is the project home for fracexpl.js, a fractal
explorer designed to be embedded in a web page. The design and user
interface is taken from the Java applet developed by Peter Van Roy and
others at RPI to accompany the "African Fractals" lessons by Ron
Eglash. See Ron Eglash's web page
(<http://homepages.rpi.edu/~eglash/eglash.htm>) and the Culturally
Situated Design Tools website (<https://csdt.rpi.edu/>) for more
information and full credits for the original applet.

For a live example (using `src/example.html`) see
<https://span.uncg.edu/fractals/example.html>.

## Usage

To include the fractal explorer in a web page, you must do two things:

1. Include the JavaScript source in the `head` section of your web
page, and include a copy of Bootstrap CSS (required for button styling
and a few other visual elements).

2. Include an empty `div` with `class=fractaltool`, which can take
some optional `data` properties:

* `data-width`: The width of the fractal explorer canvas in
  pixels. The minimum width is 640, and the default is 800 if this is
  not specified.

* `data-height`: The height of the fractal explorer canvas in
  pixels. The minimum height is 320, and the default is 600 if this is
  not specified.
  
* `data-seed`: The name of a seed to load into the fractal explorer
  when it is initialized. This must be a built-in fractal name, from
  the list given below.

* `data-seedlist`: A comma-separated list of fractals to include in
  the dropdown list of standard fractals that can be loaded in edit
  mode.

* `data-mode`: Set to "draw" to start the fractal explorer in drawing
  mode (by default it starts in edit mode).

* `data-levels`: Initial number of levels of recursion for drawing
  mode (default is 1).

The JavaScript will will insert the fractal explorer into the `div`
once the page has loaded. See `src/example.html` for an example.

## Built-in Fractals

The following fractal seeds are hard-coded into the fracexpl.js file,
and can be used by including the name as data-seed or in the list of
names in data-seedlist. These seeds were converted from the original
Java applet seeds, extracted from data files supplied by Ron
Eglash. Most are used in the "African Fractals" lessons -- see those
lessons for more information.

* 3crosses
* baila
* blanket
* bullhorn
* cantorpaper
* carpet
* chaetophora
* cnegative
* cpositive
* davincitree2
* davincitree3
* davincitree4
* dendrite
* ethiopian2
* ethiopian
* fern
* fractalsprials
* ghanahorns
* goldenrec
* kitwe
* koch
* kochsmall
* logone
* lungs
* mokoulek
* nankani
* negative
* neuron
* positive
* queenanne
* riverbasin
* sierpinski
* sprout
* turbulence
* villi
* sharkfin


## Room for Improvement

The code is fully functional for use in the original application, the
"African Fractals" lessons from Ron Eglash. The JavaScript code is
organized around a general multi-modal editor, with each of the two
basic modes (draw mode and edit mode) defined in a JavaScript
class. Below are some directions for future improvements or
extensions:

### Extension for variable-width drawing lines

The original Java applet had an option for the drawing linewidth to
decrease with each level of recursion. This property is preserved in
the standard seed definitions, stored as `thicknessType`, but this is
not actually used in drawing and there is no way to enable/disable
this in edit mode. Adding support would involve modifying the drawing
function (which should be easy) and adding the control in edit mode.

### General code cleanup

There are two main places where the code could benefit from better
design. First, classes were defined for each mode (edit mode and draw
mode), and the actual seed definition data is somewhat arbitrarily
stored in the draw mode object. Having a separate `FractalSeed` class
that is separate from either mode would be better. Second, generated
DOM elements are given `id`s that are not necessarily unique if there
are multiple fractal explorer instances on a single page. This doesn't
seem to cause a problem, since these elements aren't reference by
`id`, but nonetheless `id` attributes should be distinct on principle.

### Better double-click handling

On a double-click, JavaScript delivers both `Click` and `DblClick`
events. While this is inherrent in JavaScript, and the current code
appears to handle this OK, it seems like there should be a better way
to distinguish between single clicks and double clicks.

## License

fracexpl.js is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License (GNU GPL) as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.  The code is
distributed WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU GPL
for more details.

As additional permission under GNU GPL version 3 section 7, you may
distribute non-source (e.g., minimized or compacted) forms of that
code without the copy of the GNU GPL normally required by section 4,
provided you include this license notice and a URL through which
recipients can access the Corresponding Source.




