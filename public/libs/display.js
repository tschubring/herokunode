//boats.push(newBoat({num:0, loaded:false, local:true, x:0, y:0, speed:0, pitch:0, iRads:0}));
var carSize=.2;
var maxSpeed=.3;

function newBoat(conf){
  console.log(conf);
  var trans=new THREE.MeshPhongMaterial({"emissive":new THREE.Color("rgb(32,32,32)"), "color":new THREE.Color("rgb(255,255,0)"), "opacity":.5,   "transparent":true});
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

  var carRoll  = new THREE.Mesh( geometry, trans );
  var geometry = new THREE.CubeGeometry( 5,5,5 );
  var carPitch = new THREE.Object3D();
  carPitch.add(carRoll);
  var carYaw = new THREE.Object3D();
  carYaw.add(carPitch);
  scene.add(carYaw);

  var geometry = new THREE.SphereGeometry( .5, 8, 8 );
  //var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
  var material = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 1});
  var temp  = new THREE.Mesh( geometry, material );
  var light = new THREE.PointLight( 0xff0000, 7, 10 );
  temp.add( light );
  scene.add( temp );
  temp.scale.set(carSize*2,carSize*2,carSize*2);

  conf.missileModel=temp;

  conf.carRoll=carRoll;
  conf.carRoll=carRoll;
  conf.carPitch=carPitch;
  conf.carYaw=carYaw;


       var loader = new THREE.OBJLoader();
       loader.load('libs/airboat.obj',  function ( object ) {
          console.log("num "+conf.num);

          boat=object;
          //console.log(piece);
        
          boat.scale.x=carSize;
          boat.scale.y=carSize;
          boat.scale.z=carSize;
          boat.position.y=carSize*4;
          //piece.rotation.y=0;
          for(var bc=0; bc<boat.children.length; bc++){
            boat.children[bc].material.color.r=.75;
            boat.children[bc].material.color.g=.5;
            boat.children[bc].material.color.b=.5;
          }
          boats[boats.length-1].carRoll.add(boat);
          boats[boats.length-1].model=boat;
          boats[boats.length-1].loaded=true;
          

        });

  return conf;
}

function dbug(str){
  document.getElementById('debug').style.display="block";
  document.getElementById('debug').innerHTML=str;
}
function dbuga(str){
  document.getElementById('debug').innerHTML+='<br />'+str;
}
function rnd(range){
  return Math.floor(Math.random()*range);
}

function islandFromSeeds(ctx, across, seeds){
  var r0=seeds[0];
  var r1=seeds[1];
  var r2=seeds[2];
  var r3=seeds[3];
  var r4=seeds[4];
  var r5=seeds[5];
  var r6=seeds[6];
  var r7=seeds[7];

  var xSkew=seeds[8]-.5;
  var ySkew=seeds[9]-.5;

  var px=1;
  var round=1;//Math.floor(across/64);
  var cells=across;
  var pi=Math.PI;
  var scaleAll=.5;
  var scale0=scaleAll*(across/16+16*r3);
  var scale1=scaleAll*(across/32+32*r6);
  var scale2=scaleAll*(across/40+37*r7);
  var scale3=scaleAll*(across/54+60*r5);
  //document.getElementById('debugDiv').innerHTML="scale0:"+scale0+" "+scale1;
  for(var x=0; x<cells*px; x+=px){
    for(var y=0; y<cells*px; y+=px){
      var xFrac=.5-Math.cos(2*pi*x/across)/2;
      var yFrac=.5-Math.cos(2*pi*y/across)/2;
      var shapeFrac=Math.sin((y*xSkew+x+across/2)/(scale0+scale0*r1))/3+Math.cos((x*ySkew+y+across/2)/(scale0+scale0*r0))/3+.5+r2/2;
      var terrainFrac=Math.sin((y*ySkew+x+across/2)/(scale1+scale1*r3))/3+Math.cos((x*xSkew+y+across/2)/(scale1+scale1*r2))/3+.66;
      var noiseFrac=Math.sin((x+across/2)/(scale2+scale2*r5))/3+Math.cos((y+across/2)/(scale2+scale2*r4))/3+.75;
      var smallFrac=Math.sin((x+across/2)/(scale3+scale3*r7))/3+Math.cos((y+across/2)/(scale3+scale3*r6))/3+1;
      //shapeFrac=1;
      //smallFrac=1;
      //noiseFrac=1;
      //terrainFrac=1;
      //xFrac=1;
      //yFrac=1;


      var val=Math.floor(256*yFrac*xFrac*shapeFrac*terrainFrac*noiseFrac*smallFrac/round)*round;
      if(val>255){
        var over=val-255;
        val=255-over;
      }
      if(val<0){
        val=0;
      }
      if(val>-1){
        ctx.fillStyle="rgb("+val+","+val+","+val+")";
      }
      else{
        ctx.fillStyle="rgb(0,0,255)";
      }
      ctx.fillRect(x,y,px,px);
      }
  }
}

function xyxyToRads(x1,y1,x2,y2){
  var deltaX = x2 - x1;
  var deltaY = y1 - y2;
  var rads = Math.atan2(deltaY, deltaX); // In radians
  return (rads+2*pi)%(2*pi);
}
function xRadiansScale(rads, scale){
   return Math.cos(rads)*scale;
}
function yRadiansScale(rads, scale){
   return Math.sin(rads)*scale;
}
function createGeometryFromMap(ctx) {
  var depth = useSize;
  var width = useSize;
  var spacingX = 1;
  var spacingZ = 1;
            var pixel = ctx.getImageData(0, 0, width, depth);
            var geom = new THREE.Geometry;
            var output = [];
            for (var x = 0; x < depth; x++) {
                var row=[];
                for (var z = 0; z < width; z++) {
                    // get pixel
                    var roadWidth=48;
                    var roadThresh=2;
                    // since we're grayscale, we only need one element
                    var yValue = pixel.data[(width-z) * 4 + (depth * x * 4)] / heightOffset;

                    //if((yValue >15)&&(yValue<16.5)&&((x/2)%roadWidth>roadThresh)&&((z/2)%roadWidth>roadThresh)){yValue=18;}
                    if(((x/2)%roadWidth<=roadThresh)||((z/2)%roadWidth<=roadThresh)){
                      if(yValue>15){
                        //yValue=Math.floor(yValue/2)*2;
                      }
                      else{
                        //yValue*=.97;
                      }
                    }


                    row.push(yValue);

                    var vertex = new THREE.Vector3(x * spacingX, yValue, z * spacingZ);
                    geom.vertices.push(vertex);

                    //var geometry = new THREE.SphereGeometry( .05, 8, 8 );
                    //var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
                    //var temp  = new THREE.Mesh( geometry, material );
                    //temp.position.x=x-useSize/2+.5;
                    //temp.position.z=z-useSize/2+.5;
                    //temp.position.y=yValue;
                    //scene.add( temp );

                }
                heightMap.push(row);
            }
            // we create a rectangle between four vertices, and we do
            // that as two triangles.
            for (var z = 0; z < depth - 1; z++) {
                
                for (var x = 0; x < width - 1; x++) {
                    // we need to point to the position in the array
                    // a - - b
                    // |  x  |
                    // c - - d
                    var a = x + z * width;
                    var b = (x + 1) + (z * width);
                    var c = x + ((z + 1) * width);
                    var d = (x + 1) + ((z + 1) * width);
                    var face1 = new THREE.Face3(a, b, d);
                    var face2 = new THREE.Face3(d, c, a);
                    face1.color = calcColor(Math.floor(heightOffset*getHighPoint(geom, face1)));
                    face2.color = calcColor(Math.floor(heightOffset*getHighPoint(geom, face2)));
                    geom.faces.push(face1);
                    geom.faces.push(face2);
                }
            }
            geom.computeVertexNormals(true);
            geom.computeFaceNormals();
            geom.computeBoundingBox();
            var zMax = geom.boundingBox.max.z;
            var xMax = geom.boundingBox.max.x;
            var mesh = new THREE.Mesh(geom, new THREE.MeshLambertMaterial({
                vertexColors: THREE.FaceColors,
                color: 0x666666,
                shading: THREE.NoShading
            }));
            mesh.translateX(-xMax / 2);
            mesh.translateZ(-zMax / 2);
            scene.add(mesh);
            mesh.name = 'valley';





}
function getHighPoint(geometry, face) {
  var v1 = geometry.vertices[face.a].y;
  var v2 = geometry.vertices[face.b].y;
  var v3 = geometry.vertices[face.c].y;
  return Math.max(v1, v2, v3);
}
function worldAlt(worldX,worldZ){
  if(worldX===undefined){return 0;}
  //console.log(heightMap.length);
  var half=useSize/2;
  var a=0;
  var z=Math.floor(worldZ+half-.5);
  var x=Math.floor(worldX+half-.5);
  //console.log(x+" "+z);
  if((x<0)||(x>=useSize-1)||(z<0)||(z>=useSize-1)){return a;}
  var xFrac=(worldX+half-.5)-x; // excursion from nw
  var zFrac=(worldZ+half-.5)-z;
  var xInv=1-xFrac;
  var zInv=1-zFrac;
  var nw=heightMap[x][z];
  var ne=heightMap[x+1][z];
  var sw=heightMap[x][z+1];
  var se=heightMap[x+1][z+1];
        var dnw=Math.sqrt(xFrac*xFrac+zFrac*zFrac);
  var dne=Math.sqrt(xInv*xInv+zFrac*zFrac);
  var dsw=Math.sqrt(xFrac*xFrac+zInv*zInv);
  var dse=Math.sqrt(xInv*xInv+zInv*zInv);
        if(dnw>1){dnw=1};
  if(dne>1){dne=1};
  if(dsw>1){dsw=1};
  if(dse>1){dse=1};
  var cnw=1-dnw;
  var cne=1-dne;
  var csw=1-dsw;
  var cse=1-dse;
  var cSum=cnw+cne+csw+cse;
  a=(nw*(cnw/cSum)+ne*(cne/cSum)+sw*(csw/cSum)+se*(cse/cSum));
   return a;
}
function calcColor(val){
  var r=Math.floor(128*(Math.cos(val*pi/13)+1));
  var g=Math.floor(128*(Math.cos(val*pi/17)+1));
  var b=Math.floor(128*(Math.cos(val*pi/7)+1));
  var color = new THREE.Color("rgb("+val+","+Math.floor(128+val/2)+","+(val)+")");
  //var color = new THREE.Color("rgb("+r+","+g+","+b+")");
  
  if(val==0){
    color = new THREE.Color("rgb(0,0,200)");
  }
  return color;
}
