# Isometric Plant View & Editor

This project contains the technical artifacts and "how to"s for a simple isometric plant view canvas and editor.

There are three UI components:

* the CANVAS which draws the tiles and handles selection
* the CONTROLS which can be used to change zoomlevel and detail overlays
* the EDITOR pane which is only used during creating the plant view

All screen components are connected to a SERVICE which holds the data and state.

![Demo screen](https://github.com/BulloRosso/isoplant/blob/master/screenshot.PNG?raw=true)

This component set was created to support different selection scenarios:
* Select an set of tiles (Line or Workcenter in the toolbar)
* Select a single tile (Machine in the toolbar)

This component set was also created to ease navigation by defining areas:
* An area is a rectangular set of tiles with a area name associated

In the sample image above the match type "Line" was selected and you can see that 4 tiles
were highlighted. In other words: you hit any member of a tile set to select it - like
the tile containing the machine "L100-1" was hit - but this led to the selection of "Line L1".

## Use Cases
This project is useful for facility management:

* Visualizing the position of sensors in IoT scenarios on a floor plan
* Selecting and zooming different areas 
* Visualizing the status of certain assets (e. g. error on machines)
* Overlaying the plan with indicators (e. g. sensort data or alerting information)

In order to create and edit a floorplan a rudimentary editor pane is included as control.

## Alternatives

One of the requirements for this control was to create the most simple component in regard to runtime requirements and
ease of handling (for the user as well as the developer).

While you could imagine an implementation using a full blown 3D engine (like Unity3D) along with all fancy features (like free rotation, advanced level of detail zooming) this would certainly impose a quite heavy impact upon the available budget: creating a full scale world from the AutoCAD files of the shopfloor machinery would require weeks of highly skilled personell alone!
Optimizing the loading times on mobile devices as well as compatibility issues can become a nightmare in some environments, too.

If you just need a top down view of the facility you could use Leaflet, which supports some nice level of detail zoom options. In this case you are restricted to a top down projection.

## To Dos
The following features need to be implemented
* save tile configuration
* currently tile pane is fixed 10 x 10 tiles
* toolbar could be moved to a separate component

## Eventing between components

![Component communication](https://github.com/BulloRosso/isoplant/blob/master/components.PNG?raw=true)

Because editing is done on an administrator's page it is provided by a separate component.

It is arguable whether the tiled-canvas should contain the controls component - but to make the code more readable
I decided to split it in a different component (this ensures the view can be controlled externally - like with code-behind
of a simple button).

## Panning, Zooming & Responsiveness
In the initial versions the panZoom lib was used - but in a later stage replaced by d3 v4 because of panZoom's dependency on jQuery.

While some d3 modules suffer from poor documentation the zoom module has one the most concise and brilliant written documentation I've ever seen in open source software: [D3 Zoom: The Missing Manual](https://www.datamake.io/blog/d3-zoom) by Lars Verspohl. Combined with the comprehensive [code examples](https://bl.ocks.org/mbostock/3680958) by Mike Bostock (which are breathtaking minimal crafted) it was a breeze to integrated panning & zooming into my project!

## Technical base: HTMLCanvas

It is possible to choose either an SVG element or a HTMLCanvas element as a rendering base.

The current example is placing SVG images upon a HTMLCanvas - this might be faster on mobile
devices while it is more memory consuming at 4K devices.

If you prefer using SVG it can be easily modified in the `renderXXX()` methods and opens
up interesting options for animation. I avoided SVG because this project was not planned
as a data driven document.

## Coordinate system

This is the orientation of the grid coordinates (can be visualized by setting the grid parameters):

![Grid orientation](https://github.com/BulloRosso/isoplant/blob/master/grid-orientation.PNG?raw=true)

## Zooming in on areas

An area is a rectangle defined by coordinate points. It does not correlate to a cells ID
parameters (Line, Workcenter, Machine,...) and is meant to model larger areas on a floorplan:

![Zoomed area](https://github.com/BulloRosso/isoplant/blob/master/zoomed-area.PNG?raw=true)

The area above has the coordinates `7,1` and `8,2`. You define an area by selecting the most
south-western point and as a second parameter the most nort-eastern point.

There is a method `focusEntity(bound1,bound2)` in the canvas component which is currently not exposed to the outside.

This method currently zooms in on hardcoded sample areas. This should be implemented as a part of
the map data JSON.

## Level of detail (LOD)

Because the canvas elements are redrawn during the zoom process you can hide certain elements to achieve an uncluttered overall visual.

As an example for LOD the tiles' labels are not visible on zoom level 1 - they appear on zoom levels 2 to 4 (max zoom).

For example you could add more badges at higher zoom levels (not implemented).

## Dependencies
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.1 and uses Angular Material.

Panning and zooming is done with the help d3 zoom module (v4).

## Layered rendering of a tile
Different images can be layered on a tile - to do this, imgName is a list of comma separated names.

![Layering of elements](https://github.com/BulloRosso/isoplant/blob/master/tile-layers.PNG?raw=true)

The example above would have imgName: "road,door,boxes" (attention: avoid spaces here!).

## Overlay information (badges)
One of the main goals of the map is to add some kind of status information to the objects which
have been plaed on the map. This is done with the help of a map<string,string> which is optional for each tile: add the name of the information (e. g. "oee") with a number or a color code:

![Editing of elements](https://github.com/BulloRosso/isoplant/blob/master/badges.PNG?raw=true)

Numbers are displayed whereas color-codes will result in some kind of LED (with a glow effect). You can
configure the glow effect in the grid basic properties of the canvas control.

## Editor pane
To edit tiles an (optional) component can be used exposing the properties of a tile:

![Editing of elements](https://github.com/BulloRosso/isoplant/blob/master/editor.PNG?raw=true)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
