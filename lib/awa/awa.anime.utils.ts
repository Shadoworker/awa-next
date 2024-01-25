import { EFFECT_ID_BODY } from "./awa.constants";

export function getTimelineItems(_svgInstance : any, _timeline : any = null)
{
    var children =  _timeline.children;
    
    // console.log("children")
    // console.log(children)

    var allItems : any[] =  [];
    var items : any[] = [];
    var effectItems : any[] = [];

    for (let i = 0; i < children.length; i++) {

        const animations = children[i].animations;

        var item = {
                targets: '',
                name:'',
                delay:0
            }

        var isEffect = false;

        for (let e = 0; e < animations.length; e++) 
        {
              
            var el = animations[e];

            var name = el.animatable.target.instance.m_name; 
            var id = "#"+el.animatable.target.instance.attr("id");
            isEffect = id.includes(EFFECT_ID_BODY);

            var keysToInclude = ["value", "duration", "delay", "keyTime"]
            // var tweens = [...el.tweens]
            var tweens = cloneAndSelectKeys(el.tweens, keysToInclude)
            
            var property = el.property;
            item.name = name;
            item.targets = id;
            
            var _tweens: any[] = [];

            for (let j = 0; j < tweens.length; j++) {
                const t = tweens[j];
                
                var _value = t.value;
                var _duration = t.duration;
                var _delay = t.delay;
                var _keyTime = t.keyTime;

                var _tween : any = {
                    value : _value,
                    duration : _duration,
                    delay : _delay,
                    keyTime : _keyTime
                }

                _tweens.push(_tween)
            }                   

            item[property] = _tweens;

            // console.log('_tweens')
            // console.log(_tweens)

        }
        
        allItems.push(item);

        if(!isEffect)
            items.push(item);
        else
            effectItems.push(item)
    }
    
    // console.log('items')
    // console.log(items)

    // Combine effects with elems
    var newItems = [...items];

    for (let i = 0; i < effectItems.length; i++) 
    {
        const eff = effectItems[i];
        var effectOwnerId = eff.targets.split(EFFECT_ID_BODY)[0];
        var effectOwnerIndex = newItems.findIndex(el=>el.targets == effectOwnerId);
        var effectIndexInAllItems = allItems.indexOf(eff);

        if(effectOwnerIndex != -1)
        {
            newItems.splice(effectOwnerIndex+(i+1), 0, eff);
        }
        else
        {
            var effectOwnerName = _svgInstance.findOne(effectOwnerId).m_name; // Get name of the owner
            var bareOwnerElement = {targets : effectOwnerId, name : effectOwnerName, delay : 0, translateX:[]};

            if(effectIndexInAllItems >= items.length)
            {
                newItems.push(bareOwnerElement);
                newItems.push(eff);
            }
            else
            {
                newItems.splice(effectIndexInAllItems, 0, bareOwnerElement);
                newItems.splice(effectIndexInAllItems+1, 0, eff);
            }
        }
        
    }

    return newItems;
    
}

function cloneAndSelectKeys(array, keysToSelect) {
  return array.map(obj => {
    // Using destructuring to select specific keys
    const selectedObj = {};
    keysToSelect.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        selectedObj[key] = obj[key];
      }
    });
    return selectedObj;
  });
}

export function createNewTween(_currentAnims, _keyTime, _targetedProperty, _value)
{
    var keyTime = _keyTime; // Bigger than the last item keyTime for insertAtEnd | and less for insertBefore

    // Get tweens
    var tweens = [..._currentAnims[_targetedProperty]];

    if((tweens.length == 0) || (keyTime > tweens[tweens.length-1].keyTime))
    {
        // console.log("FIRST|AFTER LAST")
        var thatTween = {...tweens[tweens.length-1]} || {keyTime : 0};
        // console.log(tweens[tweens.length-1])
        var value = _value;
        var duration = _keyTime - thatTween.keyTime;

        var newTween : any = {
            value : value,
            duration : duration, 
            delay : 0,
            keyTime : keyTime,
        }

        tweens.push(newTween)

    }
    else // Inferior or Equal
    {
        var findEqual = tweens.find(t=>t.keyTime == keyTime)

        if(findEqual) // Then update this one
        {

            var thatTweenIndex : number = tweens.indexOf(findEqual);

            var value = _value;  

            var newTween : any = {
                value : value,
                duration : findEqual.duration, 
                delay : findEqual.delay,
                keyTime : keyTime,
            }

            tweens[thatTweenIndex] = newTween;
        }
        else // Insert after the item having a .keyTime < keyTime
        {
            // console.log("INNER")

            var itemData = findClosestTween(tweens, keyTime);
            var thatTween = {...itemData[0]};
            var thatTweenIndex : number = itemData[1];
            var nextTween = {...tweens[thatTweenIndex+1]};

            if(itemData[0])
            {
                var value = _value;

                // Update thatTween duration : Because now a new animation is in front of it
                var thatTweenOldDuration = thatTween.duration;
                if(thatTween.duration > 0)
                {
                    thatTween.duration = keyTime - thatTween.keyTime;
                }

                var duration = keyTime - thatTween.keyTime; // 

                // Update nextTween duration too
                if(nextTween)
                {
                    nextTween.duration = nextTween.keyTime - keyTime;
                    tweens[thatTweenIndex+1] = nextTween;
                }

                var newTween : any = {
                    value : value,
                    duration : duration, 
                    delay : 0,
                    keyTime : keyTime,
                }

                tweens.splice(thatTweenIndex+1, 0, newTween);

            }
            else
            {
                console.error("KeyTime out of interval !")
            }
        }

    }

    return tweens;

    
}


function findClosestTween(_tweens, _myKeytime)
{
   
    let left = 0;
    let right = _tweens.length - 1;
    let closestIndex = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midKeyTime = _tweens[mid].keyTime;

        if (midKeyTime <= _myKeytime) {
            closestIndex = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (closestIndex !== -1) {
        return [_tweens[closestIndex], closestIndex];
    } else {
        return [null, closestIndex]; // No closest tween found
    }

}


export function getPopertyInitialValue(_prop, _values)
{
    return _values[_prop];
}