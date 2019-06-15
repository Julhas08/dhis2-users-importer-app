import React from 'react';
import {connect} from 'react-redux';
import Papa from 'papaparse';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Card from 'material-ui/Card/Card';
import CardText from 'material-ui/Card/CardText';
import {Button} from '@dhis2/d2-ui-core';
import {InputField} from '@dhis2/d2-ui-core';
import axios from 'axios';
import swal from 'sweetalert';
import LinearProgress from '../components/ui/LinearProgress';
import * as config  from '../config/Config';
import * as styleProps  from '../components/ui/Styles';
import * as actionTypes from '../constants/actions.js';
import { formatDate } from '../components/helpers/DateFormat';
import { hash } from '../components/helpers/Hash';
import { getRandomInt } from '../components/helpers/RandomNumber';
import { 
    getOrgUnitDetail,
    getOrgUnitsChild,
    updateOrgUnits,
    createUsersWithRandomCode,
    getSystemId,
    getListofUsers,
    getUserDetails
} from '../components/api/API';

styleProps.styles.cardWide = Object.assign({}, styleProps.styles.card, {
  width: (styleProps.styles.card.width * 3) + (styleProps.styles.card.margin * 4),
});
const fetchOptions = config.fetchOptions;
class WHONETFileReader extends React.Component {
    constructor(props) {
        super(props);
        const d2        = props.d2;
        this.state = {
            csvfile     : undefined,
            orgUnitField: '',
            d2          : d2,
            teiResponse : '',        
            loading     : false,
            error       : false,
            userOrgUnitName: props.orgUnit,
            fileFormatValue: '',
            isModalOpen: false,
            userRoles  : "",
            userAuthority : "",             
            dataElements: [],
            attributes: [],
            optionList: [],
            counter: 0,
            emptyTrackedEntityPayload: false,
        };       
            
    }

    createUsers = (orgUnitId, userRoleId, userGroupId) => {
   
        // Fetch org unit full json 
        getOrgUnitsChild(orgUnitId).then((orgUnits) => {
            let orgUnitParentName = orgUnits.data.name;
            let orgUnitchildren   = orgUnits.data.children;
            orgUnitchildren.map((childrenId) =>{
                getOrgUnitDetail(childrenId.id).then( (orgUnits) =>{
                    let randNumber = getRandomInt(10000, 11111); 
                    orgUnits.data.code = randNumber;
                    let orgUnitCode = orgUnits.data.code;
                    let jsonPayload = JSON.stringify({ "id": orgUnits.data.id, "name": orgUnits.data.name, "shortName": orgUnits.data.shortName, "openingDate": orgUnits.data.openingDate , "code": orgUnits.data.code, "parent": { "id": orgUnitId } });
                    updateOrgUnits('api/organisationUnits/'+childrenId.id, jsonPayload).then( (updateResponse) =>{
                        console.log("Org unit Update Response: ", updateResponse.data);
                    });
                    let firstName = orgUnits.data.name;
                    let surName = orgUnitParentName;
                    getSystemId().then((systemId) =>{
                        createUsersWithRandomCode(systemId.data.codes[0], orgUnits.data.id, firstName, surName, randNumber, userRoleId, userGroupId).then( result => {

                            console.log("result: ", result.data);

                            if(result.data.status === "OK"){
                                this.setState({
                                    loading: false,
                                });
                            }
                        });
                    });
                    
                });
            });

        });
        
        this.setState({
            loading: true,
        });
    };

    onChangeValue = (field, value) => {
        this.setState({ [field]: value });
    };

    createUserPrealert = () =>{

        let orgUnitId = document.getElementById('selectedOrgUnitId').value;
        let userRoleId = document.getElementById('userRoleId').value;
        let userGroupId = document.getElementById('userGroupId').value;
        if(typeof orgUnitId === 'undefined' || orgUnitId === null || orgUnitId === ''){
            swal({
                title: "Sorry! Please select organisation unit first!",
                icon: "warning",
            });
        } else if(typeof userRoleId === 'undefined' || userRoleId === null || userRoleId === ''){
            swal({
                title: "Sorry! You forgot to add user role UID!",
                icon: "warning",
            });
        } else if(typeof userGroupId === 'undefined' || userGroupId === null || userGroupId === ''){
            swal({
                title: "Sorry! You forgot to add user group UID!",
                icon: "warning",
            });
        } else {

            swal({
              title: "Are you sure want to create users?",
              //text: "Once uploaded, you will not be able to recover WHONET-DHIS2 data!",
              icon: "warning",
              buttons: true,
              dangerMode: true,
            })
            .then((willCreate) => {
                
              if (willCreate) {
                this.createUsers(orgUnitId, userRoleId, userGroupId);
              } else {
                swal({
                    title: "Your data is safe!",
                    icon: "success",
                });
              }
            });
        }   

        
    }

    render() {
        const classes = this.props;
        let tabaleData;

        if(typeof this.props.usersInfo !='undefined'){
          this.props.usersInfo.map( row => {

            tabaleData = <TableRow key={row.id}>
              <TableCell component="th" scope="row" style={styleProps.styles.tableHeader}>
                {row.name}
              </TableCell>
              <TableCell style={styleProps.styles.tableHeader}>

              </TableCell>
            </TableRow>
          }) 
        }
        let spinner;
        if(this.state.loading){
          spinner = <LinearProgress />
        }

    return (
      <div>
          <Card style={styleProps.styles.card}>
              <CardText style={styleProps.styles.cardText}>
                  
                  <h3 style={styleProps.styles.cardHeader}>BULK USERS CREATE WITH USERS ROLE, GROUP AND ORG UNIT! 
                  </h3> 

                  <InputField
                    label="Organisation Unit"
                    value={this.props.orgUnit}
                    disabled
                    onChange={(value) => this.onChangeValue("orgUnitField", value)}
                    name = "selectedOrgUnit"
                  /><input
                    type="hidden" id="selectedOrgUnitId" value ={this.props.orgUnitId}
                    />
                  <br />

                  <InputField
                    label="User role UID"
                    value={this.state.roleID}
                    disabled
                    onChange={(value) => this.onChangeValue("userRoleId", value)}
                    name = "userRoleId"
                  />
                  <input
                    type="hidden" id="userRoleId" value ={this.state.userRoleId}
                    />
                  <br />

                  <InputField
                    label="User Group UID"
                    value={this.state.groupID}
                    disabled
                    onChange={(value) => this.onChangeValue("userGroupId", value)}
                    name = "userGroupId"
                  />
                  <input
                    type="hidden" id="userGroupId" value ={this.state.userGroupId}
                    />
                  <div style={styleProps.styles.buttonPosition}></div>
                  <Button type="submit" raised color='primary' onClick={this.createUserPrealert}>CREATE USERS</Button>

                  <br />                  

              </CardText>
              <CardText style={styleProps.styles.cardText}>
                {spinner} 
              </CardText>

          </Card>
          <Card style={styleProps.styles.cardUsers}>
            <CardText style={styleProps.styles.cardText}>
            <Paper className={classes.root}  style={styleProps.styles.tableScroll}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={styleProps.styles.tableHeader}> 
                        <strong><h2> User Name</h2></strong>
                      </TableCell>
                      <TableCell style={styleProps.styles.tableHeader}> 
                        <strong><h2> Password </h2></strong> 
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>            
                    {
                        tabaleData

                    }             
                  </TableBody>          
                </Table>
            </Paper>    
            </CardText>
        </Card>
      </div>

    );
  }
}
/**
* Redux framework has introduced
* This below section is under development
*/
const mapStateToProps = state =>{
    return {
        ctr: state.counter,
    };    
};

const mapToDispatchToProps =  (dispatch) =>{
    return {
        createUserPrealert: () => dispatch({type: actionTypes.UPLOAD_PRE_ALERT}), 
    };
}
export default connect(mapStateToProps, mapToDispatchToProps)(WHONETFileReader);
