//
// Hierarchical object using recursion.  Uses dummy objects in a way that is
// Similar to HierarchyWithTree2, but is based on a version of CS336Object.js.
//


// Creates data for vertices, colors, and normal vectors for
// a unit cube.  Return value is an object with three attributes
// vertices, colors, and normals, each referring to a Float32Array.
function makeCube()
{
	  // vertices of cube
	var rawVertices = new Float32Array([  
	-0.5, -0.5, 0.5,
	0.5, -0.5, 0.5,
	0.5, 0.5, 0.5,
	-0.5, 0.5, 0.5,
	-0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, 0.5, -0.5,
	-0.5, 0.5, -0.5]);

	var rawColors = new Float32Array([
	1.0, 0.0, 0.0, 1.0,  // red
	0.0, 1.0, 0.0, 1.0,  // green
	0.0, 0.0, 1.0, 1.0,  // blue
	1.0, 1.0, 0.0, 1.0,  // yellow
	1.0, 0.0, 1.0, 1.0,  // magenta
	0.0, 1.0, 1.0, 1.0,  // cyan
	]);

	var rawNormals = new Float32Array([
	0, 0, 1,
	1, 0, 0,
	0, 0, -1,
	-1, 0, 0,
	0, 1, 0,
	0, -1, 0 ]);


	var indices = new Uint16Array([
	0, 1, 2, 0, 2, 3,  // z face
	1, 5, 6, 1, 6, 2,  // +x face
	5, 4, 7, 5, 7, 6,  // -z face
	4, 0, 3, 4, 3, 7,  // -x face
	3, 2, 6, 3, 6, 7,  // + y face
	4, 5, 1, 4, 1, 0   // -y face
	]);
	
	var verticesArray = [];
	var colorsArray = [];
	var normalsArray = [];
	for (var i = 0; i < 36; ++i)
	{
		// for each of the 36 vertices...
		var face = Math.floor(i / 6);
		var index = indices[i];
		
		// (x, y, z): three numbers for each point
		for (var j = 0; j < 3; ++j)
		{
			verticesArray.push(rawVertices[3 * index + j]);
		}
		
		// (r, g, b, a): four numbers for each point
		for (var j = 0; j < 4; ++j)
		{
			colorsArray.push(rawColors[4 * face + j]);
		}
		
		// three numbers for each point
		for (var j = 0; j < 3; ++j)
		{
			normalsArray.push(rawNormals[3 * face + j]);
		}
	}
	
	return {
	  numVertices: 36,
		vertices: new Float32Array(verticesArray),
		colors: new Float32Array(colorsArray),
		normals: new Float32Array(normalsArray)
	};
}


//Returns elements of the transpose of the inverse of the modelview matrix.
function makeNormalMatrixElements(model, view)
{
  var n = new Matrix4(view).multiply(model);
  n.invert();
  n.transpose();
  
  
  // take just the upper-left 3x3 submatrix
  n = n.elements;
  return new Float32Array([
  n[0], n[1], n[2],
  n[4], n[5], n[6],
  n[8], n[9], n[10] ]);
}


// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexNormalBuffer;

// handle to the compiled shader program on the GPU
var lightingShader;

// create the objects
var towerDummy = new CS336Object();//Highest level 'entity', all other objects stem from this for the recursive draw function

var tower = new CS336Object(drawCube);
tower.setScale(2,15,2);
towerDummy.addChild(tower);

var genhousingDummy = new CS336Object();
genhousingDummy.setPosition(0,15,0);
towerDummy.addChild(genhousingDummy);

var genhousing = new CS336Object(drawCube);
genhousing.setPosition(0,-7,0);
genhousing.setScale(3,2,3);
genhousingDummy.addChild(genhousing);


var rotorDummy = new CS336Object();
rotorDummy.setPosition(0,-7,2.5);
//towerDummy.addChild(rotorDummy);
genhousingDummy.addChild(rotorDummy);

var rotor = new CS336Object(drawCube);
rotor.setPosition(0,0,0);
rotor.setScale(1,1,3);
rotorDummy.addChild(rotor);

var f_rotorblade = new CS336Object(drawCube);
//f_rotorblade.setPosition(-4.9,-7,3);
f_rotorblade.setPosition(-4.9,0,1);
f_rotorblade.setScale(9,2,1);
rotorDummy.addChild(f_rotorblade);

var s_rotorblade = new CS336Object(drawCube);
s_rotorblade.setPosition(4.9,0,1);
s_rotorblade.setScale(9,2,1);
rotorDummy.addChild(s_rotorblade);

// view matrix
var view = new Matrix4().setLookAt(
		20, 20, 20,   // eye
		0, 0, 0,            // at - looking at the origin
		0, 1, 0);           // up vector - y axis

// Here use aspect ratio 3/2 corresponding to canvas size 600 x 400
var projection = new Matrix4().setPerspective(45, 1.5, 0.1, 1000);

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

// handler for key press events adjusts object rotations
function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
	case 't':
		rotorDummy.setRotation(new Matrix4().setRotate(1,0,0,1).multiply(rotorDummy.rotation));
		break;
	case 'h':
		f_rotorblade.setRotation(new Matrix4().setRotate(15,1,0,0).multiply(f_rotorblade.rotation));
		s_rotorblade.setRotation(new Matrix4().setRotate(-15,1,0,0).multiply(s_rotorblade.rotation));
		break;
	case 'H':
		f_rotorblade.setRotation(new Matrix4().setRotate(-15,1,0,0).multiply(f_rotorblade.rotation));
		s_rotorblade.setRotation(new Matrix4().setRotate(15,1,0,0).multiply(s_rotorblade.rotation));
		break;
	case 'l':
		genhousingDummy.setRotation(new Matrix4().setRotate(15,0,1,0).multiply(genhousingDummy.rotation));
		break;
	case 'L':
		genhousingDummy.setRotation(new Matrix4().setRotate(-15,0,1,0).multiply(genhousingDummy.rotation));
		break;
	default:
			return;
	}
}

// helper function renders the cube based on the given model transformation
function drawCube(matrix)
{
	  // bind the shader
	  gl.useProgram(lightingShader);

	  // get the index for the a_Position attribute defined in the vertex shader
	  var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
	  if (positionIndex < 0) {
	    console.log('Failed to get the storage location of a_Position');
	    return;
	  }

	  var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
	  if (normalIndex < 0) {
		    console.log('Failed to get the storage location of a_Normal');
		    return;
		  }
	 
	  // "enable" the a_position attribute 
	  gl.enableVertexAttribArray(positionIndex);
	  gl.enableVertexAttribArray(normalIndex);
	 
	  // bind data for points and normals
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);
	  
	  var loc = gl.getUniformLocation(lightingShader, "view");
	  gl.uniformMatrix4fv(loc, false, view.elements);
	  loc = gl.getUniformLocation(lightingShader, "projection");
	  gl.uniformMatrix4fv(loc, false, projection.elements);
	  loc = gl.getUniformLocation(lightingShader, "u_Color");
	  gl.uniform4f(loc, 0.0, 1.0, 0.0, 1.0);
    var loc = gl.getUniformLocation(lightingShader, "lightPosition");
    gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);
    
	  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
	  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");
	  
	  gl.uniformMatrix4fv(modelMatrixloc, false, matrix.elements);
	  gl.uniformMatrix3fv(normalMatrixLoc, false, makeNormalMatrixElements(matrix, view));
	  
	  gl.drawArrays(gl.TRIANGLES, 0, 36);
	  
	  gl.useProgram(null);
}

// code to actually render our geometry
function draw()
{
  // clear the framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

	// recursively render everything in the hierarchy
	towerDummy.render(new Matrix4());
	//torsoDummy.render(new Matrix4());
}

// entry point when page is loaded
function main() {

  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is 
  // redrawn	
	
  // retrieve <canvas> element
  var canvas = document.getElementById('theCanvas');

  // key handler
  window.onkeypress = handleKeyPress;

  // get the rendering context for WebGL, using the utility from the teal book
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById('vertexLightingShader').textContent;
  var fshaderSource = document.getElementById('fragmentLightingShader').textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  lightingShader = gl.program;
  gl.useProgram(null);
  
  // create model data
  var cube = makeCube();
  
  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  
  gl.enable(gl.DEPTH_TEST);
  
  // define an animation loop
  var animate = function() {
	draw();
	rotorDummy.setRotation(new Matrix4().setRotate(1,0,0,1).multiply(rotorDummy.rotation));
    requestAnimationFrame(animate, canvas); 
  };
  
  // start drawing!
  animate();

  
}
