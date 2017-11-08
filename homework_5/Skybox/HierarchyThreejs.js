/**
 * Using a hierarchical object in three.js.  This is similar
 * to HierarchyWithTree3.js.  Each piece of the robot is
 * contained within a dummy object that is unscaled and only
 * rotates about its own center.  The visible object can then
 * be scaled without affecting the scales of its child
 * objects, and it can be shifted within the dummy object
 * to make it appear to rotate about a point other than its 
 * center. 
 * 
 * Use a/A, s/S, t/T to rotate arm, shoulder, or torso.
 */
var torsoDummy;
var shoulderDummy;
var armDummy;


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
  switch(ch)
  {
  case 't':
    torsoDummy.rotateY(15 * Math.PI / 180);
    break;
  case 'T':
    torsoDummy.rotateY(-15 * Math.PI / 180);
    break;
  case 's':
    shoulderDummy.rotateX(-15 * Math.PI / 180);
    break;
  case 'S':
    shoulderDummy.rotateX(15 * Math.PI / 180);
    break;
  case 'a':
    armDummy.rotateX(-15 * Math.PI / 180);
    break;
  case 'A':
    armDummy.rotateX(15 * Math.PI / 180);
    break;
    default:
      return;
  }
}

function start()
{
  window.onkeypress = handleKeyPress;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000 );
  camera.position.set(20, 10, 20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  var ourCanvas = document.getElementById('theCanvas');

  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
  renderer.setClearColor(0xffffff);

  // create a green cube
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
  
  // torsoDummy is parent of torso cube and shoulder dummy
  torsoDummy = new THREE.Object3D();
  
  var torso = new THREE.Mesh(geometry, material);
  torso.scale.set(10, 10, 5);
  torsoDummy.add(torso);
  
  // shoulderDummy is parent of shoulder cube and arm dummy
  shoulderDummy = new THREE.Object3D();
  torsoDummy.add(shoulderDummy);
  
  // shift the shoulder dummy 6.5 units in x-direction (5 to edge of torso, 
  // plus 1.5 units for half width of shoulder).  Shift it up 4 so its
  // center of rotation is one unit from top of torso
  shoulderDummy.position.set(6.5, 4, 0);
  
  var shoulder = new THREE.Mesh(geometry, material);
  shoulderDummy.add(shoulder);
  shoulder.scale.set(3, 5, 2);
 
  // shift the shoulder down 2 units within the shoulder dummy object
  // since its height is 5, it will appear to rotate about a point 0.5 units
  // from its top
  shoulder.position.set(0, -2, 0);
  
  armDummy = new THREE.Object3D();
  shoulderDummy.add(armDummy);

  // we want the center of rotation for the arm to be at the front bottom
  // corner of the shoulder object, which is already shifted 2 units down from the 
  // shoulder dummy.  So we need 2 units for that shift plus 2.5 units for half
  // the length of the arm object.
  armDummy.position.set(0, -4.5, 1.0); 

  var arm = new THREE.Mesh( geometry, material );
  armDummy.add(arm);
  arm.scale.set(3, 5, 2); 

  // move arm 2.5 units down and 1 unit back so it lines up with shoulder
  arm.position.set(0, -2.5, -1.0);
  
  // add torso dummy to the scene
  scene.add( torsoDummy );
  

  var light = new THREE.PointLight(0xffffff, 1.0);
  light.position.set(2, 3, 5);
  scene.add(light);
  
  light = new THREE.AmbientLight(0x555555);
  scene.add(light);

  var render = function () {
    requestAnimationFrame( render );
    renderer.render(scene, camera);
  };

  render();
}