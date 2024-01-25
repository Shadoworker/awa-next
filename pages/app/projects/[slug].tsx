import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../../redux/main/mainActions'
import { useRouter, withRouter } from 'next/router';
import contentService from '../../../services/content.service';


interface Props {
}
interface State {
   index : number,
   navState : any,
   game : any
}


class GameDetailPage extends Component<any,State> {


  constructor(props: any) {
    super(props);
    this.state = {
      index : 0,
      navState : true,
      game : null,
    };
  }


  componentDidMount(): void {
    
      // window.scrollTo(0,0);
  }
 
   render(): React.ReactNode {
     return(
        <div className="awa-page">
           
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


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(GameDetailPage));
