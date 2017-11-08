//
// The spinning cube example with Phong shading in three.js,
// using a texture for the surface of the model.
// Depends on CameraControl.js.
//
var path = "../images/sky/";
var imageNames = [
                  path + "px.jpg",
                  path + "nx.jpg",
                  path + "py.jpg",
                  path + "ny.jpg",
                  path + "pz.jpg",
                  path + "nz.jpg"
                  ];

var modelFilename;
modelFilename = "../models/teapot.obj";


var axis = 'y';
var paused = false;
var camera;

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

function handleKeyPress(event)
{
  var ch = getChar(event);
  if (cameraControl(camera, ch)) return;
}

function start()
{
  // only do this if we were given a filename to use
  if (modelFilename)
  { 
    var callback = function(loadedModel, materials) 
    {
      // assume only one object in the .obj file
      var child = loadedModel.children[0]; 
      var geometry = child.geometry;
      startForReal(geometry);
    };

    // load the model file asynchronously
    var objLoader = new THREE.OBJLoader();
    objLoader.load(modelFilename, callback);
  }
  else
  {
    startForReal()
  }
}

function startForReal(geometry)
{
 window.onkeypress = handleKeyPress;

  var scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000);
  
  camera.translateZ(50);
  
  var ourCanvas = document.getElementById('theCanvas');
  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

  // load the six images
  var ourCubeMap = new THREE.CubeTextureLoader().load( imageNames );

  // this is too easy, don't need a mesh or anything
  scene.background = ourCubeMap;
  
  // load texture - need to set wrapping parameters to repeat
  var url = "../images/check64.png";
  var loader = new THREE.TextureLoader();
  var texture = loader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // Choose a geometry
  if (!geometry)
  {	  
	  var geometry = new THREE.SphereGeometry(1);
  }

  var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x222222, shininess: 50, map: texture } );

  // Create a mesh
  var theModel = new THREE.Mesh( geometry, material );
  
  // set a scale so the model is roughly one unit in diameter
  geometry.computeBoundingSphere();
  var scale = 1 / geometry.boundingSphere.radius;
  theModel.scale.set(scale*4, scale*4, scale*4); 
  theModel.position.set(0,0,7);

  // Add it to the scene
  scene.add( theModel );

  var person1 = new personHierarchy(scene,null,null,null,null,5);
  var person2 = new personHierarchy(scene, 8, null, 5, 5,5);
  var person3 = new personHierarchy(scene, -8, null, 5, -5,5);
  var person4 = new personHierarchy(scene, 5, null, 13, 7,5);
  var person5 = new personHierarchy(scene, -5, null, 13, -7,5);

  //For fun make a pyramid formation 'phalanx'
  var person6 = new personHierarchy(scene, null, null, 100,null, 5);
  var person7 = new personHierarchy(scene, 4 ,null, 105);
  var person8 = new personHierarchy(scene, -4 ,null, 105);
  var person9 = new personHierarchy(scene, 8,null, 110);
  var person10 = new personHierarchy(scene, -8,null, 110);
  var person11 = new personHierarchy(scene,0,null,110);
  var person12 = new personHierarchy(scene,12,null,115);
  var person13 = new personHierarchy(scene,-12,null,115);
  var person15 = new personHierarchy(scene,-6,null,115);
  var person16 = new personHierarchy(scene,6,null,115);
  var person16 = new personHierarchy(scene,0,null,115);
  
  var person17 = new personHierarchy(scene,0,null,120);
  var person18 = new personHierarchy(scene,12, null, 120);
  var person19 = new personHierarchy(scene,-12,null,120);
  var person20 = new personHierarchy(scene,6,null,120);
  var person21 = new personHierarchy(scene,-6,null,120);
  var person22 = new personHierarchy(scene,18,null,120);
  var person23 = new personHierarchy(scene,-18,null,120);


  var light = new THREE.PointLight(0xffffff, 1.0);
  light.position.set(2,3,9);
  scene.add(light);

  var render = function () {
    renderer.render(scene, camera);
    var increment = 0.5 * Math.PI / 180.0;  // convert to radians
    if (!paused)
    {
		  // extrinsic rotations
      var q;
      switch(axis)
      {
      case 'x':
        // create a quaternion representing a rotation about x axis
        q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0),  increment);       
        break;
      case 'y':
        q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  increment);
        break;
      case 'z':
        q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1),  increment);
        break;       
      default:
      }
	}
      // left-multiply the theModel's quaternion, and then set the new value
	theModel.setRotationFromQuaternion(q.multiply(theModel.quaternion))
    requestAnimationFrame( render );
  };

  render();
}

//A little person factory
var personHierarchy = function(scene, xshift=null, yshift=null, zshift = null, rotation=null, armRotation=null){
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
  
  var head_geo = new THREE.SphereGeometry(1,8,6);
  var head_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var sphere = new THREE.Mesh(head_geo, head_material);
  scene.add(sphere);

  // torsoDummy is parent of torso cube and shoulder dummy
  torsoDummy = new THREE.Object3D();
  torsoDummy.translateX(xshift);
  torsoDummy.translateY(yshift);
  torsoDummy.translateZ(zshift);
  torsoDummy.rotateY(rotation);
  
  var torso = new THREE.Mesh(geometry, material);
  torso.scale.set(2, 3,2);
  torsoDummy.add(torso);

  // shoulderDummy is parent of the head
  var headDummy = new THREE.Object3D();
  torsoDummy.add(headDummy);
  headDummy.position.set(0,2,0);

  var head = new THREE.Mesh(head_geo, head_material);
  headDummy.add(head);
  head.scale.set(0.75,0.75,0.75);

  //TODO: Add a hat
  
  // shoulderDummy is parent of shoulder cube and arm dummy
  rightShoulderDummy = new THREE.Object3D();
  torsoDummy.add(rightShoulderDummy);
  
  rightShoulderDummy.position.set(1.5, 0.75, 0);
  
  var rightShoulder = new THREE.Mesh(geometry, material);
  rightShoulderDummy.add(rightShoulder);
  rightShoulder.scale.set(1, 1.5, 1);

  //flipped version of the right shoulder
  leftShoulderDummy = new THREE.Object3D();
  torsoDummy.add(leftShoulderDummy);

  leftShoulderDummy.position.set(-1.5, 0.75, 0);
  var leftShoulder = new THREE.Mesh(geometry, material);
  leftShoulderDummy.add(leftShoulder);
  leftShoulder.scale.set(1, 1.5, 1);

  //Shoulder rotation
  leftShoulderDummy.rotateZ(-armRotation);
  rightShoulderDummy.rotateZ(armRotation);

  //left leg
  leftLegDummy = new THREE.Object3D();
  torsoDummy.add(leftLegDummy);
  leftLegDummy.position.set(-0.5, -2, 0);
  var leftLeg = new THREE.Mesh(geometry, material);
  leftLegDummy.add(leftLeg);
  leftLeg.scale.set(0.5,3,1);

  //right leg
  rightLegDummy = new THREE.Object3D();
  torsoDummy.add(rightLegDummy);
  rightLegDummy.position.set(0.5, -2, 0);
  var rightLeg = new THREE.Mesh(geometry, material);
  rightLegDummy.add(rightLeg);
  rightLeg.scale.set(0.5,3,1);
  
  // add torso dummy to the scene
  scene.add( torsoDummy );
};
