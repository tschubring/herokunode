function generateIsland(ctx, across){
  var r0=rnd(1000)/1000;
  var r1=rnd(1000)/1000;
  var r2=rnd(1000)/1000;
  var r3=rnd(1000)/1000;
  var r4=rnd(1000)/1000;
  var r5=rnd(1000)/1000;
  var r6=rnd(1000)/1000;
  var r7=rnd(1000)/1000;
  var xSkew=rnd(1000)/1000-.5;
  var ySkew=rnd(1000)/1000-.5;

  var px=1;
  var round=1;//Math.floor(across/64);
  var cells=across;
  var pi=Math.PI;
  var scaleAll=1;
  var scale0=scaleAll*(across/16+rnd(across/16));
  var scale1=scaleAll*(across/32+rnd(across/32));
  var scale2=scaleAll*(across/37+rnd(across/37));
  var scale3=scaleAll*(across/60+rnd(across/60));
  //document.getElementById('debugDiv').innerHTML="scale0:"+scale0+" "+scale1;
  for(var x=0; x<cells*px; x+=px){
    for(var y=0; y<cells*px; y+=px){
      var xFrac=.5-Math.cos(2*pi*x/across)/2;
      var yFrac=.5-Math.cos(2*pi*y/across)/2;
      var shapeFrac=Math.sin((y*xSkew+x+across/2)/(scale0+scale0*r1))/3+Math.cos((x*ySkew+y+across/2)/(scale0+scale0*r0))/3+.66;

      var terrainFrac=Math.sin((y*ySkew+x+across/2)/(scale1+scale1*r3))/3+Math.cos((x*xSkew+y+across/2)/(scale1+scale1*r2))/3+1;
      var noiseFrac=Math.sin((x+across/2)/(scale2+scale2*r5))/3+Math.cos((y+across/2)/(scale2+scale2*r4))/3+.5;
      var smallFrac=Math.sin((x+across/2)/(scale3+scale3*r7))/3+Math.cos((y+across/2)/(scale3+scale3*r6))/3+.75;


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
  var deltaY = y2 - y1;
  var rads = Math.atan2(deltaY, deltaX); // In radians
  return (rads+2*pi)%(2*pi);
}
function xRadiansScale(rads, scale){
   return Math.cos(rads)*scale;
}
function yRadiansScale(rads, scale){
   return Math.sin(rads)*scale;
}
