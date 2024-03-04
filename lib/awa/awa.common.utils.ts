import { CANVAS_ID_BODY, CLIP_ID_BODY, CONTAINER_ID_BODY, GROUP_ID_BODY, MEDIA_PICKER_TYPES, MEDIA_RENDER_MODE } from "./awa.constants";
import { ELEMENT_EFFECTS } from "./awa.core";

export function isNumber(value) {
    return !isNaN(value) && typeof value === 'number';
}

export function rgbToHex(orig, ignoreAlpha = true) {
    var a, isPercent,
    rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (rgb && rgb[4] || "").trim(),
    hex = rgb ?
    (rgb[1] | 1 << 8).toString(16).slice(1) +
    (rgb[2] | 1 << 8).toString(16).slice(1) +
    (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 1;
  }
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  if(!ignoreAlpha)
    hex = hex + a;

  return "#"+hex;

  }

export function isObjectEmpty(_obj)
{
  return Object.entries(_obj).length == 0;
}

export function isElementPath(_type)
{
  return _type == "path";
}

export function getNextEffectIndex(_effects)
{
  var nextIndex = 0;
  _effects.reduce((acc, current) => {
    // Extract numeric parts and convert to numbers
    const numericAcc = parseInt(acc.id.match(/\d+/)[0]);
    const numericCurrent = parseInt(current.id.match(/\d+/)[0]);
    
    nextIndex = numericCurrent + 1;
    // Compare numeric values
    return numericCurrent > numericAcc ? current : acc;
  }, _effects[0]);

  return nextIndex;
}

export function removeEffect(_effects, _effectId)
{
  const newEffects = _effects.filter(e => e.id !== _effectId);

  return newEffects;
}

export function hexToRgba(hex) {
  // remove invalid characters
  hex = hex.replace(/[^0-9a-fA-F]/g, '');

  if (hex.length < 5) { 
      // 3, 4 characters double-up
      hex = hex.split('').map(s => s + s).join('');
  }

  // parse pairs of two
  let rgba = hex.match(/.{1,2}/g).map(s => parseInt(s, 16));

  // alpha code between 0 & 1 / default 1
  rgba[3] = rgba.length > 3 ? parseFloat(rgba[3] / 255+"").toFixed(2): 1;

  return {
    r:rgba[0],
    g:rgba[1],
    b:rgba[2],
    a:rgba[3]
  }
}
 

export function orderEffects(_effects = [])
{
  // Define the pattern order
  const orderPattern = Object.values(ELEMENT_EFFECTS);

  // Custom comparison function
  function compareObjects(a, b) {
    const aIndex = orderPattern.indexOf(a.name);
    const bIndex = orderPattern.indexOf(b.name);

    return aIndex - bIndex;
  }

  // Sort the array
  const sortedEffects = _effects.slice().sort(compareObjects);
  return sortedEffects;
}

export function isGroup(_el)
{
  var type = _el.type;
  return type == "g";
} 


export function isRect(_el)
{
  var type = _el.type;
  return type == "rect";
} 

export function isCanvas(_el) // Check using element entity
{
  var _isGroup = isGroup(_el);
  var id = _el.attr("id");
  return _isGroup && id.includes(CANVAS_ID_BODY);
} 

export function isCanvasElement(_id) // Check using element id components
{ 
  return _id.includes(CANVAS_ID_BODY) && _id.includes(GROUP_ID_BODY);
} 

export function isCanvasClipElement(_id) // Check using element id components
{ 
  return _id.includes(CLIP_ID_BODY) && _id.includes(GROUP_ID_BODY);
} 


export function isCanvasContainer(_el)
{
  var _isRect = isRect(_el);
  var id = _el.attr("id");
  return _isRect && id.includes(CANVAS_ID_BODY) && id.includes(CONTAINER_ID_BODY);
} 

export function isCanvasChild(_el)
{
  return _el.canvasOwnerId() != null;
} 

export function isPointInCanvas(_p, _el)
{
  var 
    x = _p.x,
    y = _p.y,
    rectX = _el.getBoundingClientRect().x, // Using getBoundingClientRect instead of svg bbox for pos fidelity
    rectY = _el.getBoundingClientRect().y,
    rectX2 = _el.getBoundingClientRect().right,
    rectY2 = _el.getBoundingClientRect().bottom;

  return x >= rectX && x <= rectX2 && y >= rectY && y <= rectY2;

} 


export function sortAnimationsByName(_animations)
{

  var sorted = _animations.sort(function(a, b){
    if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
  })

  return sorted;
} 

export function getElementTreeType(_type)
{

  return _type == "g" ? "folder" : "file";

} 

export function isGradient(_colorString)
{
  return _colorString.includes('%');
}

export function getGradientValues(_colorString)
{
  var type = _colorString.split("-gradient")[0];
  var part1 = _colorString.split("gradient(")[1];
  var part11 = (part1.split("%)")[0] + "%").toLowerCase();


  if(part11.includes('rgb(')) 
  {
    part11 = part11.replace(')', ', 1)') // fixing first value rgb val
    part11 = part11.replace('rgb(', 'rgba(')
  }

  part11 = part11.replace('  ', ' ')

  var segments = part11.split(", rgba")

  var angle = segments[0].split('deg')[0];

  var values : any[] = []

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];

    var color = 'rgba'+seg.split(') ')[0]+')'
    var percentage = seg.split(') ')[1]

    values.push({color : color, percentage:percentage})
    
  }

  var data = {type : type, angle : angle, values : values};

  return data;
}



export function mediaToBase64(file) {
  
  return new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;

})}

export function isMediaImage(_base64)
{
  return _base64.includes(MEDIA_PICKER_TYPES.image);
}

export function isMediaVideo(_base64)
{
  return _base64.includes(MEDIA_PICKER_TYPES.video);
}

export function initBg(base64, patternId, elementSize, renderMode = MEDIA_RENDER_MODE.fill, tile = 4)
{

  var img = new Image();
  img.src = base64;
  img.onload = function()
  {
      
    var realWidth = img?.naturalWidth;
    var realHeight = img?.naturalHeight;

    var rectX  = elementSize.x;
    var rectY = elementSize.y;
    var rectWidth  = elementSize.width;
    var rectHeight = elementSize.height;

    if(renderMode == MEDIA_RENDER_MODE.fill) // Fill
    {

      var bgWRatio = rectWidth / realWidth, 
          bgHRatio = rectHeight / realHeight;

      var scaler = (realWidth>realHeight) ? bgHRatio : bgWRatio;

      document.querySelector("#"+patternId)?.setAttribute("width", realWidth.toString())
      document.querySelector("#"+patternId)?.setAttribute("height", realHeight.toString())

      document.querySelector("#"+patternId+" image")?.setAttribute("width", realWidth.toString())
      document.querySelector("#"+patternId+" image")?.setAttribute("height", realHeight.toString())

      scaler = 0.5;
      var newBgWidth = realWidth * scaler;
      var newBgHeight = realHeight * scaler;

      const translateX = rectX + (rectWidth - newBgWidth)/2;
      const translateY = rectY + (rectHeight - newBgHeight)/2;
      
      var reverseScaler = 1-scaler;
      
      document.querySelector("#"+patternId)?.setAttribute("x", `${translateX}`)
      document.querySelector("#"+patternId)?.setAttribute("y", `${translateY}`)

      document.querySelector("#"+patternId+" image")?.setAttribute("transform", `scale(${scaler}) `)


    }
    
    else if(renderMode == MEDIA_RENDER_MODE.fit) // Fit
    {

      var bgWRatio = rectWidth / realWidth, 
          bgHRatio = rectHeight / realHeight;

      document.querySelector("#"+patternId)?.setAttribute("width", realWidth.toString())
      document.querySelector("#"+patternId)?.setAttribute("height", realHeight.toString())

      document.querySelector("#"+patternId+" image")?.setAttribute("width", realWidth.toString())
      document.querySelector("#"+patternId+" image")?.setAttribute("height", realHeight.toString())

      var newBgHeight = realHeight * bgWRatio;
      const translateY = (rectHeight - newBgHeight)/2;

      document.querySelector("#"+patternId+" image")?.setAttribute("transform", `scale(${bgWRatio}) translate(0, ${translateY})`)


    }
    
    else if(renderMode == MEDIA_RENDER_MODE.tile) // Tile
    {
      // document.querySelector('#gridSlider').value = baseScale;
      var tileW = realWidth/tile, 
          tileH = realHeight/tile;

      document.querySelector("#"+patternId)?.setAttribute("width", tileW.toString())
      document.querySelector("#"+patternId)?.setAttribute("height", tileH.toString())

      document.querySelector("#"+patternId)?.setAttribute("baseWidth", realWidth.toString())
      document.querySelector("#"+patternId)?.setAttribute("baseHeight", realHeight.toString())
      document.querySelector("#"+patternId)?.setAttribute("hSpacing", "0")
      document.querySelector("#"+patternId)?.setAttribute("vSpacing", "0")

      document.querySelector("#"+patternId)?.setAttribute("width", tileW.toString())
      document.querySelector("#"+patternId)?.setAttribute("height", tileH.toString())

      // Spacing Sliders max values

      // document.querySelector("#hSpacingSlider").setAttribute("maxSpacing", (rectWidth-tileW))
      // document.querySelector("#vSpacingSlider").setAttribute("maxSpacing", (rectHeight-tileH))
      

    }

  }

  
}
