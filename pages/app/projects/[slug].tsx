import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../../redux/main/mainActions'
import { useRouter, withRouter } from 'next/router';
import contentService from '../../../services/content.service';
import ColorPicker from 'react-best-gradient-color-picker';

import ReactGPicker from 'react-gcolor-picker';


interface Props {
}
interface State {
   index : number,
   navState : any,
   game : any
}


class Projects extends Component<any, any> {


  constructor(props: any) {
    super(props);
    this.state = {
      index : 0,
      navState : true,
      game : null,
    };
  }


  componentDidMount() {
    
      // window.scrollTo(0,0);


      function parseGradient(gradientString) {
        const radialPattern = /radial-gradient\((.+?)\)/gi;
        const colorStopPattern = /(rgb(?:a)?\(\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*\d*\.?\d+)?\))\s+(\d*\.?\d+%)?/gi;
    
        let stops : any[] = [];
        let circlePosition : any = null;
        let type : any = null;
    
        // Check if it's a radial gradient
        let match = radialPattern.exec(gradientString);
        if (match) {
            type = "radial";
            const radialGradientString = match[1];
            const circlePositionMatch = /circle\s+at\s+([a-z\s]+)(?=[,)])/gi.exec(radialGradientString);
            if (circlePositionMatch) {
                circlePosition = circlePositionMatch[1].trim();
            }
    
            let parts = gradientString.split(', r');
            let stopsParts = parts.splice(0,1);
            
            // Parse color stops
            // let stopMatch;
            let stopMatch = colorStopPattern.exec(radialGradientString)
            // while ((stopMatch = colorStopPattern.exec(radialGradientString)) !== null) {
                console.log(radialGradientString);
            //     const [, color, stop] = stopMatch;
            //     stops.push({ color, stop });
            // }
        }
    
        return { type, circlePosition, stops };
    }
    
    // Example usage
    const gradientString = "radial-gradient(circle at right top, rgb(0, 0, 0) 0.00%, rgb(112, 54, 54) 100.00%)";
    const { type, circlePosition, stops } = parseGradient(gradientString);
    
    console.log("Gradient Type:", type);
    if (type === "radial") {
        console.log("Circle Position:", circlePosition);
    }
    console.log("Color Stops:");
    stops.forEach(stop => {
        console.log(`Color: ${stop.color}, Stop: ${stop.stop}`);
    });
    

  }

  onChange()
  {

  }
 
   render(): React.ReactNode {
     return(
        <div>
            {/* <Ant.Popover open={true}> */}
            <div>
              <ReactGPicker value='red' gradient onChange={this.onChange} />
            </div>
            
            {/* </Ant.Popover> */}
        </div>
    )
  };
};
const mapStateToProps = (state:any) => {
  return {
    mainState: state.mainReducer
  };
};

const mapDispatchToProps = (dispatch:any) => {
  return {
    mainActions: bindActionCreators(mainActions, dispatch)
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Projects));
