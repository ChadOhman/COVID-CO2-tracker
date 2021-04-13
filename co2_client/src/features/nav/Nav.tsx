import React, {useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import {Link, Redirect} from 'react-router-dom';
import NavItem from 'react-bootstrap/NavItem';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { LinkContainer } from 'react-router-bootstrap';

// import {Login, LoginFormType} from '../login/Login';
// import {Logout} from '../login/Logout';
import {formatErrors} from '../../utils/ErrorObject';

import {homePath, devicesPath, profilePath, deviceModelsPath, placesPath} from '../../paths/paths';

// import {HomePage} from '../home/HomePage';
import {selectGoogleProfile, selectUsername, setUsername, GoogleProfile} from '../login/loginSlice';

import {get_email} from '../../utils/Authentication';
import { GoogleLoginLogoutContainer } from '../login/Login';

type NavBarProps = {
}

// const renderLoginSignup = (): JSX.Element => 
// <>
//     <LinkContainer to='login'>
//         <NavItem className='nav-item'>Login</NavItem>                
//     </LinkContainer>

//     <LinkContainer to='signup'>
//         <NavItem className='nav-item'>Signup</NavItem>                
//     </LinkContainer>
// </>

// ugly casts fixes some kind of bizarre bug in styled components: https://github.com/styled-components/styled-components/issues/1198#issuecomment-336621217
// as unknown as unknown is my hack to fix THAT bug's interaction with typescript
const loggedIn = (username: string) =>
  <NavDropdown title={username} id="basic-nav-dropdown" flip={1 as unknown as boolean} alignRight renderMenuOnMount>
    <NavDropdown.Item>
        <LinkContainer to={profilePath}>
            <NavItem className='nav-item'>{username}'s profile</NavItem>
        </LinkContainer>
    </NavDropdown.Item>
    <NavDropdown.Item>
      <GoogleLoginLogoutContainer/>
    </NavDropdown.Item>
  </NavDropdown>

function loginOrSignupMaybe(username: string): JSX.Element {
  if (username === '') {
    // console.log("no username, rendering login/signup options")
    return (
      <>
        <GoogleLoginLogoutContainer/>        
      </>
    )
  }
  // console.log("logged in, rendering profile and logout");
  // debugger;
  return loggedIn(username);
}


/*
      <Navbar>
        <Nav>
          <Navbar.Collapse className="justify-content-end" id="basic-navbar-nav">
          </Navbar.Collapse>
        </Nav>
      </Navbar>

*/

interface UserNavProps {
    username: string,
    googleProfile: GoogleProfile | null
}

// const profileIfLoggedIn = (username: string): JSX.Element => {
//     if (username === '') {
//         console.log("not logged in, not rendering profile tab");
//         return (<></>);
//     }

//     return (
//         <LinkContainer to='/profile'>
//             <NavItem className='nav-item'>{username}'s profile</NavItem>
//         </LinkContainer>
//     )
// }

const UserNav: React.FC<UserNavProps> = ({username, googleProfile}) =>
    <Navbar expand="sm" /*bg="dark" variant="dark"*/ >
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse  id="basic-navbar-nav">
            <Nav justify={true} fill={false} variant="tabs" style={{display:"flex", flexDirection:"row", float: "left"}}>
                <LinkContainer to={homePath}>
                    <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer to={devicesPath}>
                    <Nav.Link>Devices</Nav.Link>
                </LinkContainer>
                <LinkContainer to={deviceModelsPath}>
                    <Nav.Link>Models</Nav.Link>
                </LinkContainer>
                <LinkContainer to={placesPath}>
                    <Nav.Link>Places</Nav.Link>
                </LinkContainer>

            </Nav>
            <Nav className="container-fluid justify-content-end" variant="tabs" style={{display:"flex", flexDirection:"row", float: "right"}}>
                {/* {profileIfLoggedIn(username)} */}
                <Nav.Link href="https://github.com/ariccio/COVID-CO2-tracker">Github/sponsor</Nav.Link>
                {loginOrSignupMaybe(username)}
                {/* <LinkContainer to='/logout'><NavItem className='nav-item'>Logout {props.username}</NavItem></LinkContainer> */}
                {/* <NavItem className='nav-item' pullRight>{props.username}</NavItem> */}
            </Nav>
        </Navbar.Collapse>
    </Navbar>

const loadEmail = (dispatch: ReturnType<typeof useDispatch>) => {
  const emailPromise = get_email();
  emailPromise.then(email => {
    if (email === null) {
      console.warn('not logged in!');
      return;
    }
    if (email.errors === undefined){
      if (email.email === undefined) {
        alert("undefined response from server. Likely internal server error getting username!");
        debugger;
      }
      // console.log("got email: ", email.email)
      dispatch(setUsername(`(logging in...) ${email.email}`));
    }
    else {
      console.error('failed to get email!');
      console.error(formatErrors(email.errors))
    }
  }).catch((error) => {
    console.error(`Failed to get email from server! fetch itself failed with error ${error}`);
    alert(error.message);
    // debugger;
    // throw error;
  })
}

export const NavBar: React.FC<NavBarProps> = (props: NavBarProps) => {
    const username = useSelector(selectUsername);
    const googleProfile = useSelector(selectGoogleProfile);
    // if (googleProfile !== null) {
    //   debugger;
    // }
    const dispatch = useDispatch();
    useEffect(() => {loadEmail(dispatch)}, [dispatch]);
    // const setUsername_ 
    // if (username !== '') {
    //   console.log(`Current username: ${username}`)
    // }
    return <UserNav username={username} googleProfile={googleProfile}/>;
}
